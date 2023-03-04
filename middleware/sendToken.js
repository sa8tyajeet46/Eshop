exports.sendToken = async (statusCode, user, res) => {
  const token = user.getJsonWebToken();
  const options = {
    httpOnly: true,
    expire: Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    sucess: true,
    token,
    user,
  });
};
