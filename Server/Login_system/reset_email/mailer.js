import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.bookmyname.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.RESET_EMAIL_USER,
      pass: process.env.RESET_EMAIL_PASS
    },
    // BEST PRACTICE: Add a timeout and force IPv4 for this specific connection
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
  });

// Verify connection
transporter.verify()
  .then(() => console.log("📧 Password Reset Mailer: Ready"))
  .catch(err => {
    console.error("❌ Password Reset Mailer Error:", err.message);
    // Log the actual error but don't let it crash the whole app process
  });

export default transporter;