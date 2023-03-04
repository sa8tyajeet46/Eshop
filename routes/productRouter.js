const express = require("express");
const {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  createReview,
  getAllReviews,
  deleteReview,
  getAllProductAdmin,
} = require("../controller/productController");
const { isAuthenticated, AuthorizedRoles } = require("../middleware/Auth");
const router = express.Router();

router.route("/").get(getAllProducts);
router
  .route("/admin/new")
  .post(isAuthenticated, AuthorizedRoles("admin"), createNewProduct);
router
  .route("/product/admin/all")
  .get(isAuthenticated, AuthorizedRoles("admin"), getAllProductAdmin);
router
  .route("/admin/:id")
  .put(isAuthenticated, AuthorizedRoles("admin"), updateProduct)
  .delete(isAuthenticated, AuthorizedRoles("admin"), deleteProduct);
router.route("/review/new").put(isAuthenticated, createReview);
router.route("/:id").get(getSingleProduct);
router.route("/reviews/:id").get(isAuthenticated, getAllReviews);
router
  .route("/reviews/:id/product/:productId")
  .put(isAuthenticated, deleteReview);

module.exports = router;
