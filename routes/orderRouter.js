const express = require("express");
const {
  createOrder,
  myOrder,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controller/orderController");
const { isAuthenticated, AuthorizedRoles } = require("../middleware/Auth");

const router = express.Router();

router.route("/new").post(isAuthenticated, createOrder);

router.route("/myorders").get(isAuthenticated, myOrder);

router.route("/:id").get(isAuthenticated, getSingleOrder);

router
  .route("/admin/all")
  .get(isAuthenticated, AuthorizedRoles("admin"), getAllOrders);

router
  .route("/admin/update/:id")
  .put(isAuthenticated, AuthorizedRoles("admin"), updateOrderStatus);

router
  .route("/admin/delete/:id")
  .delete(isAuthenticated, AuthorizedRoles("admin"), deleteOrder);

module.exports = router;
