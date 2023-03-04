const catchAsyncError = require("./catchAsyncErrror");
const ErrorHandler = require("./../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("please Login to continue", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedData.id);

  req.user = user;

  //console.log(req.user);

  next();
});

exports.AuthorizedRoles = (role) => {
  return (req, res, next) => {
    if (role !== req.user.role) {
      return next(
        new ErrorHandler(`${req.user.role} is not allowed to access it.`, 403)
      );
    }
    return next();
  };
};
