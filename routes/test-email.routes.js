import { Router } from "express";
import transporter, { accountEmail } from "../config/nodemailer.js";

const testEmailRouter = Router();

testEmailRouter.get("/test-email", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: accountEmail,
      to: accountEmail,
      subject: "SubDub Email Test",
      html: `
        <h1>Email is working! 🎉</h1>
        <p>This is a test email from your Subscription Tracker backend.</p>
        <p>Nodemailer + Gmail is working correctly.</p>
      `,
    });

    console.log("Email sent:", info.messageId);

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

export default testEmailRouter;