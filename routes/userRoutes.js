const express = require("express");
const {
  register,
  login,
  logout,
  forgetPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRoles,
  removeUser,
  verify,
} = require("../controller/userController");
const { isAuthenticated, AuthorizedRoles } = require("../middleware/Auth");
const User = require("./../models/userModel");
const userRouter = express.Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(logout);
userRouter.route("/forgotpassword").post(forgetPassword);
userRouter.route("/resetpassword/:token").put(resetPassword);
userRouter.route("/me").get(isAuthenticated, getUserDetails);
userRouter.route("/updatePassword").put(isAuthenticated, updatePassword);
userRouter.route("/updateProfile").put(isAuthenticated, updateProfile);
userRouter.route("/confirm/signUp/:id").get(verify);
userRouter
  .route("/admin/users")
  .get(isAuthenticated, AuthorizedRoles("admin"), getAllUser);
userRouter
  .route("/admin/user/:id")
  .get(isAuthenticated, AuthorizedRoles("admin"), getSingleUser);
userRouter
  .route("/admin/user/update/:id")
  .put(isAuthenticated, AuthorizedRoles("admin"), updateUserRoles);
userRouter
  .route("/admin/user/delete/:id")
  .delete(isAuthenticated, AuthorizedRoles("admin"), removeUser);

module.exports = userRouter;
