import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter;

const getTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }

  return transporter;
};

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    console.info(`[DEV EMAIL] Password reset for ${email}: ${resetUrl}`);
    return;
  }

  await activeTransporter.sendMail({
    from: env.emailFrom,
    to: email,
    subject: "Reset your Commerce Hub password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Password reset request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Use the link below to continue:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 30 minutes.</p>
      </div>
    `,
  });
};

