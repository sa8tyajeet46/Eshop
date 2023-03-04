const app = require("./app.js");
const dotenv = require("dotenv");
const connectDatabase = require("./databaseConnection.js");
const cloudinary = require("cloudinary").v2;
process.on("uncaughtException", (err) => {
  console.log(err.message);
  process.exit(1);
});

connectDatabase();
cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  cloud_name: process.env.CLOUDINARY_NAME,
  secure: true,
  withcredentials: false,
});
const server = app.listen(process.env.PORT, () => {
  console.log(`The server is running at ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log("The server is closing due to unhandled rejection");
  server.close(() => process.exit(1));
});
