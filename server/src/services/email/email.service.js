const Mailjet = require('node-mailjet');
const env = require('../../config/env');
const logger = require('../../errorlogging/logger');

let mailjetClient = null;

function parseFromAddress(raw) {
  if (!raw) return { Email: 'no-reply@soulforge.gg', Name: 'SoulForge' };
  const match = raw.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    return {
      Name: match[1].trim() || 'SoulForge',
      Email: match[2].trim()
    };
  }
  return {
    Name: 'SoulForge',
    Email: raw.trim()
  };
}

function getMailjetClient() {
  if (mailjetClient) return mailjetClient;

  const apiKey = env.MAILJET_API_KEY || process.env.MAILJET_PUBLIC_KEY || '';
  const secretKey = env.MAILJET_SECRET_KEY || process.env.MAILJET_API_SECRET || process.env.MAILJET_PRIVATE_KEY || '';

  if (apiKey && secretKey) {
    mailjetClient = Mailjet.apiConnect(apiKey, secretKey);
  }

  return mailjetClient;
}

async function sendVerificationLink(email, token, recipientName = 'Adventurer') {
  const client = getMailjetClient();

  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const subject = 'Verify your SoulForge Account';
  
  const textBody = `Welcome to SoulForge! Please verify your email by clicking the following link: ${verificationUrl}\nThis link will expire in 24 hours.`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #121212; color: #f0f0f0; border-radius: 8px;">
      <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">SoulForge - Life RPG</h2>
      <p style="font-size: 16px; line-height: 1.5;">Greetings ${recipientName},</p>
      <p style="font-size: 14px; line-height: 1.5; color: #a0a0a0;">Welcome to SoulForge! To begin your journey, you must first verify your account by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Account</a>
      </div>
      <p style="font-size: 12px; color: #71717a; text-align: center;">Or copy and paste this link into your browser:<br/>
      <a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
      <p style="font-size: 12px; color: #71717a; margin-top: 20px;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;

  if (client) {
    try {
      const from = parseFromAddress(env.EMAIL_FROM);
      const response = await client.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: from,
            To: [
              {
                Email: email,
                Name: recipientName || 'Adventurer'
              }
            ],
            Subject: subject,
            TextPart: textBody,
            HTMLPart: htmlBody
          }
        ]
      });

      const messageData = response.body?.Messages?.[0];
      const messageId = messageData?.To?.[0]?.MessageUUID || messageData?.To?.[0]?.MessageID || 'dispatched';

      logger.info(`[EMAIL] Verification link dispatched to ${email} via Mailjet (ID: ${messageId})`);
      return { sent: true, mode: 'mailjet', id: messageId };
    } catch (error) {
      logger.error(`[EMAIL] Failed to send email via Mailjet: ${error.message}`);
      logger.info(`[VERIFICATION FALLBACK] Link for ${email}: ${verificationUrl}`);
      return { sent: false, mode: 'fallback', error: error.message };
    }
  } else {
    // In local development or when Mailjet credentials are not configured
    logger.info(`[VERIFICATION DEV MODE] Link for ${email}: ${verificationUrl}`);
    return { sent: true, mode: 'console' };
  }
}

module.exports = {
  sendVerificationLink
};

