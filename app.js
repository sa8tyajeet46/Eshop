const express = require("express");
const app = express();
const cors = require("cors");
const errorMiddleware = require("./middleware/error");
const product = require("./routes/productRouter");
const userRouter = require("./routes/userRoutes");
const paymentRouter = require("./routes/paymentRouter");
const cookieParser = require("cookie-parser");
const orderRouter = require("./routes/orderRouter");
const bodyParser = require("body-parser");
const fileUploader = require("express-fileupload");
const dotenv = require("dotenv");
//dotenv.config({ path: "./config/config.env" });

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
//app.use(express.limit("4mb"));

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUploader());
app.use("/ecom/v2/product", product);
app.use("/ecom/v2/auth", userRouter);
app.use("/ecom/v2/order", orderRouter);
app.use("/ecom/v2/process", paymentRouter);

app.use(errorMiddleware);
module.exports = app;
