const mongoose = require("mongoose");
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB)
    .then(() => console.log(`database is connected to ${process.env.DB}`));
};
module.exports = connectDatabase;
