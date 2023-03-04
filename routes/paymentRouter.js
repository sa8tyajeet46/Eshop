const express = require("express");
const { isAuthenticated, AuthorizedRoles } = require("../middleware/Auth");
const router = express.Router();
const {
  processPayment,
  sendStripeApiKey,
} = require("./../controller/paymentController");
router.route("/sendApiKey").get(isAuthenticated, sendStripeApiKey);
router.route("/payment").post(isAuthenticated, processPayment);
module.exports = router;
