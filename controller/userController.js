const ErrorHandler = require("./../utils/errorHandler");
const catchAsyncError = require("./../middleware/catchAsyncErrror");
const User = require("./../models/userModel");
const { sendToken } = require("../middleware/sendToken");
const { sendEmail } = require("./../utils/sendEmail");
const cloudinary = require("cloudinary");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
//const { findByIdAndUpdate } = require("../models/productModel");

exports.register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  if (!email) return next(new ErrorHandler("Email required", 401));
  if (password.toString().length < 8)
    return next(new ErrorHandler("password must be 8 characters long", 401));
  if (name.toString().length < 5)
    return next(new ErrorHandler("Name must be 5 characters long", 401));

  const user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("Email already registered", 401));
  let public_id = "";
  let url = "";
  if (req.body.avatar) {
    await cloudinary.v2.uploader.upload(
      req.body.avatar,
      {
        folder: "avatar",
        width: 500,
        crop: "scale",
      },

      function (error, result) {
        if (result) {
          public_id = result.public_id;
          url = result.url;
        }
      }
    );
  }
  const mailToken = jwt.sign(
    {
      name,
      email,
      password,
      avatar: {
        public_id,
        url,
      },
    },
    process.env.JWT_SECRET
  );
  const message = `<div><h1>click on the link to verify your account</h1></br><p>${process.env.HOST}/auth/confirm/signUp/${mailToken}</p>
<p>Discard if not u</p></div>`;

  try {
    await sendEmail({
      message,
      subject: "confirmation mail",
      email: req.body.email,
    });

    res.status(200).json({
      sucess: true,
      message: "confirmation Mail delivered",
    });
  } catch (error) {
    return next(new ErrorHandler("Email not sent", 400));
  }

  /*await cloudinary.v2.uploader.upload(
    req.body.avatar,
    {
      folder: "avatar",
      width: 500,
      crop: "scale",
    },

    function (error, result) {
      if (result) {
        // console.log("k");
        public_id = result.public_id;
        url = result.url;
      }
    }
  );*/
  /*const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: public_id,
      url: url,
    },
  });*/

  //sendToken(201, user, res);
});
exports.verify = catchAsyncError(async (req, res, next) => {
  const mailToken = req.params.id;
  const data = jwt.decode(mailToken.toString(), process.env.JWT_SECRET);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    avatar: data.avatar,
  });
  sendToken(201, user, res);
});
exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("please Enter Email and Password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Wrong User or Password", 401));

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect)
    return next(new ErrorHandler("Wrong User or Password", 401));

  sendToken(200, user, res);
});

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({
    sucess: true,
  });
});

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTENDURL}/${resetToken}`;

  const message = `Your reset password token is \n\n ${resetPasswordUrl} \n\n if not requested ignore it.`;

  try {
    await sendEmail({
      message,
      subject: "resetPassword",
      email: req.body.email,
    });

    res.status(200).json({
      sucess: true,
      message: `resetPassword Mail sent to ${req.body.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    console.log(error);
    await user.save({
      validateBeforeSave: false,
    });
    return next(new ErrorHandler("Email not sent", 400));
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // console.log("t");
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user)
    return next(
      new ErrorHandler("user not found or password token expires", 400)
    );

  const { resetPassword, confirmPassword } = req.body;

  if (resetPassword !== confirmPassword)
    return next(
      new ErrorHandler("password must be same as confirm password", 400)
    );

  user.password = resetPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(200, user, res);
});

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    sucess: true,
    user,
  });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isAuthenticated = await user.comparePassword(req.body.oldpassword);

  if (!isAuthenticated) return next(new ErrorHandler("invalid password", 400));

  if (req.body.newpassword !== req.body.confirmnewpassword)
    return next(
      new ErrorHandler("password must be same as confirm password", 400)
    );

  user.password = req.body.newpassword;

  await user.save();

  sendToken(200, user, res);
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const { email, name } = req.body;

  await User.findByIdAndUpdate(
    req.user.id,
    { email, name },
    {
      runValidators: true,
      new: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    sucess: true,
  });
});

//  --admin

exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    sucess: true,
    users,
  });
});

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("user not found", 404));

  res.status(200).json({
    sucess: true,
    user,
  });
});

exports.updateUserRoles = catchAsyncError(async (req, res, next) => {
  const { email, name, role } = req.body;

  await User.findByIdAndUpdate(
    req.params.id,
    { email, name, role },
    {
      runValidators: true,
      new: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    sucess: true,
    message: `${req.params.id} is set to ${role}`,
  });
});

exports.removeUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("user not found ", 404));

  await user.remove();

  res.status(200).json({
    sucess: true,
  });
});
