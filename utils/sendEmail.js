const nodemailer = require("nodemailer");

exports.sendEmail = async (obj) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const options = {
    to: obj.email,
    from: process.env.SMPT_USER,
    subject: obj.subject,
    html: obj.message,
  };
  await transporter.sendMail(options);
};
