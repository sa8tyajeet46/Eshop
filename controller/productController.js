const ErrorHandler = require("./../utils/errorHandler");
const Product = require("./../models/productModel");
const catchAsyncError = require("./../middleware/catchAsyncErrror");
const cloudinary = require("cloudinary");

const ApiFeature = require("./../utils/apiFeature");
// --all
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  // console.log(req.query);
  const pageLimit = 9;
  //  return next(new ErrorHandler("this is error", 400));
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeature.query;
  const totalProducts = products.length;

  apiFeature.pagination(pageLimit);
  products = await apiFeature.query.clone();
  res.status(200).json({
    message: "sucess",
    products,
    totalProducts,
    pageLimit,
  });
});
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("product not found", 500));
  return res.status(200).json({
    sucess: true,
    product,
  });
});
// --admin
exports.createNewProduct = catchAsyncError(async (req, res, next) => {
  // console.log(req.user);
  let images = [];
  async function k() {
    for (const item in req.body.images) {
      let public_id = "";
      let url = "";
      var cloudinary_cors =
        "https://" + req.headers.host + "/cloudinary_cors.html";
      await cloudinary.v2.uploader.upload(
        req.body.images[item],
        {
          folder: "product",
          width: 500,
          crop: "scale",
        },

        function (error, result) {
          //  console.log(error);
          if (result) {
            public_id = result.public_id;
            url = result.url;
            images = [
              ...images,
              {
                public_id,
                url,
              },
            ];
          }
        }
      );
    }
  }
  await k();
  req.body.images = images;
  req.body.user = req.user;
  console.log(req.body.images);
  const product = await Product.create(req.body);

  res.status(201).json({
    sucess: true,
    product,
  });
});
exports.getAllProductAdmin = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    sucess: true,
    products,
  });
});
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("product not found", 500));
  const newProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({
    sucess: true,
    newProduct,
  });
});
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("product not found", 500));

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }
  await product.remove();
  return res.status(200).json({
    sucess: true,
    message: "product deleted successfully",
  });
});

exports.createReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const product = await Product.findById(productId);

  if (!product) return new ErrorHandler("product not found ", 404);

  const review = {
    user: req.user._id,
    name: req.user.name,
    comment,
    rating: Number(rating),
  };

  const isReviewed = product.reviews.find(
    (key) => key.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.comment = comment;
        rev.rating = Number(rating);
      }
    });
  } else {
    product.reviews.push(review);
  }

  let avg = 0;

  product.reviews.forEach((key) => (avg += key.rating));

  avg = avg / product.reviews.length;

  product.ratings = avg;
  product.numOfReviews = product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    sucess: true,
  });
});

exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  // console.log("t");
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("product not found", 404));

  res.status(200).json({
    sucess: true,
    reviews: product.reviews,
  });
});

exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) return next(new ErrorHandler("product not found", 404));

  const reviews = product.reviews.filter(
    (rev) =>
      rev._id.toString() !== req.params.id.toString() ||
      rev.user.toString() !== req.user._id.toString()
  );

  let avg = 0;

  if (reviews.length !== 0) {
    reviews.forEach((key) => (avg += key.rating));

    avg = avg / reviews.length;
  }
  ratings = avg;
  numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.params.productId,
    { reviews, ratings, numOfReviews },
    {
      validateBeforeSave: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    sucess: true,
  });
});
