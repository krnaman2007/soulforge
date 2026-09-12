const nodemailer = require('nodemailer');
const env = require('../../config/env');
const logger = require('../../errorlogging/logger');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }

  return transporter;
}

async function sendVerificationLink(email, token) {
  const mailTransporter = getTransporter();

  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const subject = 'Verify your SoulForge Account';
  
  const textBody = `Welcome to SoulForge! Please verify your email by clicking the following link: ${verificationUrl}\nThis link will expire in 24 hours.`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #121212; color: #f0f0f0; border-radius: 8px;">
      <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">SoulForge - Life RPG</h2>
      <p style="font-size: 16px; line-height: 1.5;">Greetings Adventurer,</p>
      <p style="font-size: 14px; line-height: 1.5; color: #a0a0a0;">Welcome to SoulForge! To begin your journey, you must first verify your account by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Account</a>
      </div>
      <p style="font-size: 12px; color: #71717a; text-align: center;">Or copy and paste this link into your browser:<br/>
      <a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
      <p style="font-size: 12px; color: #71717a; margin-top: 20px;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject,
        text: textBody,
        html: htmlBody
      });
      logger.info(`[EMAIL] Verification link dispatched to ${email}`);
      return { sent: true, mode: 'smtp' };
    } catch (error) {
      logger.error(`[EMAIL] Failed to send email via SMTP: ${error.message}`);
      logger.info(`[VERIFICATION FALLBACK] Link for ${email}: ${verificationUrl}`);
      return { sent: false, mode: 'fallback', error: error.message };
    }
  } else {
    // In local development or when SMTP is not configured
    logger.info(`[VERIFICATION DEV MODE] Link for ${email}: ${verificationUrl}`);
    return { sent: true, mode: 'console' };
  }
}

module.exports = {
  sendVerificationLink
};
