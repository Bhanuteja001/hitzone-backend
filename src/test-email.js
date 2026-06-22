import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const emailUser = process.env.EMAIL_USER || "dineshmodem5132@gmail.com";
const emailPass = process.env.EMAIL_PASS;

console.log("=== HIT Zone SMTP Verification Tool ===");
console.log("Using Email Address:", emailUser);
console.log("Using Password/App Pass:", emailPass ? "********" : "(NOT CONFIGURED - EMPTY)");

if (!emailPass) {
  console.error("\n[ERROR] EMAIL_PASS is not configured in your hitzone-backend/.env file.");
  console.error("Please add the following lines to your hitzone-backend/.env file:");
  console.error("EMAIL_USER=dineshmodem5132@gmail.com");
  console.error("EMAIL_PASS=your-gmail-app-password");
  console.error("\nTo generate a Gmail App Password, follow these instructions:");
  console.error("1. Go to your Google Account (https://myaccount.google.com).");
  console.error("2. Go to 'Security' on the left navigation panel.");
  console.error("3. Under 'Signing in to Google', ensure 2-Step Verification is ON.");
  console.error("4. Search for 'App passwords' in the search box at the top or click on '2-Step Verification' and scroll to the bottom to find 'App passwords'.");
  console.error("5. Select App: 'Mail', Select Device: 'Other (Custom name)' and name it (e.g. 'HIT Dashboard').");
  console.error("6. Click Generate. Copy the 16-character password (e.g. 'xxxx xxxx xxxx xxxx').");
  console.error("7. Paste that 16-character password into your .env file as the EMAIL_PASS value (no spaces).");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

console.log("\nAttempting to send verification email to client...");
const testMailOptions = {
  from: `"HIT Zone Verification" <${emailUser}>`,
  to: emailUser, // Send a copy to yourself
  subject: "HIT Zone - SMTP Configuration Test Success",
  text: "Hello! If you are reading this email, your nodemailer SMTP config is 100% correct.",
};

transporter.sendMail(testMailOptions, (err, info) => {
  if (err) {
    console.error("\n[ERROR] SMTP email dispatch failed!");
    console.error("Nodemailer Error Details:", err);
    console.error("\nTroubleshooting tips:");
    console.error("- Verify you are using a 16-character Google App Password (not your main Gmail password).");
    console.error("- Verify that 2-Step Verification is active on dineshmodem5132@gmail.com.");
    console.error("- Make sure there are no typos in the .env file.");
  } else {
    console.log("\n[SUCCESS] Verification email sent successfully!");
    console.log("Response Message ID:", info.messageId);
    console.log("Check the inbox of dineshmodem5132@gmail.com to verify the test message arrived.");
  }
});
