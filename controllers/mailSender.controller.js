const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const User = require("../models/user.model");
// Send the OTP to the user's email
const mailerSend = new MailerSend({
  apiKey: process.env.MAILER_SEND_API_KEY,
});

const sentFrom = new Sender(
  process.env.MAILER_SEND_DOMAIN,
  process.env.MAILER_SEND_FROM_NAME
);

// const sendEmail = async (req, res, next) => {
//   try {
//     // send to multiple recipients - upgrade plan to send to multiple recipients
//     // const recipients = req.body.recipients.map((recipient) => new Recipient(recipient.email, recipient.name));

//     const recipients = [new Recipient(req.body.email, req.body.name)];

//     const emailParams = new EmailParams()
//       .setFrom(sentFrom)
//       .setTo(recipients)
//       .setReplyTo(sentFrom)
//       .setSubject(req.body.subject)
//       .setHtml(req.body.html);

//     // Send the email
//     await mailerSend.email.send(emailParams);

//     // If successful, send a success response
//     successResponse(res, null, "Email sent successfully");
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };

const sendEmail = async (req, res, next) => {
  try {
    // Send to multiple recipients (support for multiple)
    const recipients = [new Recipient(req.body.email, req.body.name)];

    // Optional CC recipients
    const ccRecipients = req.body.cc
      ? req.body.cc.map((cc) => new Recipient(cc.email, cc.name))
      : [];

    // Attachments handling (base64 encoding)
    const attachments = req.body.attachments
      ? req.body.attachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content, // base64 encoded
          type: attachment.type || "application/octet-stream",
          disposition: "attachment",
        }))
      : [];

    // Creating email parameters
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(req.body.subject)
      .setHtml(req.body.html);

    // Adding CC recipients if provided
    if (ccRecipients.length > 0) {
      emailParams.setCc(ccRecipients);
    }

    // Adding attachments if provided
    if (attachments.length > 0) {
      emailParams.setAttachments(attachments);
    }

    // Schedule sending (need to upgrade plan)
    // if (req.body.schedule) {
    // schedule field contains the future timestamp
    // req.body.schedule Has to be a Unix timestamp and has to be in the future day. check the docs for more info
    //   emailParams.setSendAt(req.body.schedule);
    // }

    // Send the email
    await mailerSend.email.send(emailParams);

    // If successful, send a success response
    successResponse(res, null, "Email sent successfully");
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const requestOtp = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;

    req.body.html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h3>Dear ${user.name},</h3>
        <p>We hope this message finds you well.</p>
        <p>As part of your ongoing request, please use the following One-Time Password (OTP) to proceed:</p>
        <p style="font-weight: bold; font-size: 18px;">${otp}</p>
        <p>Please note, for your security, this OTP will expire in a few minutes and can only be used once.</p>
        <p>If you did not initiate this request, kindly ignore this message.</p>
        <p>Thank you for choosing our service. Should you require any further assistance, feel free to reach out to our support team.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Tomato team</strong></p>
      </body>
    </html>
  `;

    const recipients = [new Recipient(req.body.email, user.name)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject(req.body.subject)
      .setHtml(req.body.html);

    // Send the email
    const result = await mailerSend.email.send(emailParams);

    if (result) {
      //  save in the session
      req.session.otp = otp;
      req.session.email = email;
      req.session.otpExpiry = Date.now() + 60000 * 2; // 2 minutes expiry
    }

    // req.session.save((err) => {
    //   if (err) {
    //     console.error("Session save error:", err);
    //   } else {
    //     console.log("Session saved successfully");
    //   }
    // });

    successResponse(res, null, "OTP sent successfully");
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  console.log(req.session, otp);

  if (req.session.otp == otp) {
    req.session.otp = null; // Clear OTP
    // check if the OTP is expired
    if (Date.now() > req.session.otpExpiry) {
      return errorResponse(res, "OTP expired", 400);
    }
    successResponse(res, null, "OTP verified successfully");
  } else {
    errorResponse(res, "Invalid OTP", 400);
  }
};

module.exports = { sendEmail, requestOtp, verifyOtp };
