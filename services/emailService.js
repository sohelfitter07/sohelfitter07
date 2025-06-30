const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (recipient, subject, body) => {
  try {
    await transporter.sendMail({
      from: `"Canadian Fitness Repair" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      text: body,
      html: `<p>${body}</p>`
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};