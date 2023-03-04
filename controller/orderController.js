const catchAsyncError = require("../middleware/catchAsyncErrror");
const ErrorHandler = require("../utils/errorHandler");
const Order = require("./../models/orderModel");
const Product = require("./../models/productModel");
exports.createOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderItems,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderItems,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    sucess: true,
    order,
  });
});

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) return next(new ErrorHandler("order not found", 404));

  res.status(200).json({
    sucess: true,
    order,
  });
});

exports.myOrder = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    sucess: true,
    orders,
  });
});

// --admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => (totalAmount += order.totalPrice));

  res.status(200).json({
    sucess: true,
    orders,
    totalAmount,
  });
});

exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("order is not found", 404));

  if (order.orderStatus === "Delivered")
    return next(new ErrorHandler("order is already delivered", 400));

  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.orderItems.forEach(async (product) => {
      await updateStock(product.product, product.quantity);
    });
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    sucess: true,
    order,
  });
});

const updateStock = async (id, q) => {
  const product = await Product.findById(id);

  product.Stock -= q;
  await product.save({ validateBeforeSave: false });
};

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("order is not found", 404));

  await order.remove();

  res.status(200).json({
    sucess: true,
  });
});
