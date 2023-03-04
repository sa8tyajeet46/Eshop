const app = require("./app.js");
const dotenv = require("dotenv");
const connectDatabase = require("./databaseConnection.js");
const cloudinary = require("cloudinary").v2;

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
