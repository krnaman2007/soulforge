const crypto = require('crypto');
const prisma = require('../../db/prisma');
const emailService = require('../email');
const { AppError } = require('../../utils/errors');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const VERIFICATION_EXPIRY_HOURS = 24;
const JWT_EXPIRES_IN = '7d';

function generateJwtToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function generateAndSendVerificationLink(user) {
  // Generate a cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Upsert to ensure only one active token per user
  await prisma.verificationToken.upsert({
    where: { userId: user.id },
    update: {
      token,
      expiresAt
    },
    create: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  // Send the email
  await emailService.sendVerificationLink(user.email, token);
}

async function verifyEmailToken(token) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: { include: { character: true } } }
  });

  if (!record) {
    throw new AppError('INVALID_TOKEN', 'Verification link is invalid or has expired.', 400);
  }

  if (new Date() > record.expiresAt) {
    // Delete expired token
    await prisma.verificationToken.delete({ where: { id: record.id } });
    throw new AppError('TOKEN_EXPIRED', 'Verification link has expired. Please request a new one.', 400);
  }

  // Atomically mark user as verified and delete the token
  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
      include: { character: true }
    });

    await tx.verificationToken.delete({
      where: { id: record.id }
    });

    return updatedUser;
  });

  // Generate JWT since the user is now fully verified and can be logged in
  const jwtToken = generateJwtToken({
    id: result.id,
    email: result.email
  });

  return {
    token: jwtToken,
    user: sanitizeUser(result),
    character: result.character
  };
}

async function resendVerificationLink(email) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    // Return success to avoid email enumeration
    return { message: 'If an account exists, a verification link has been sent.' };
  }

  if (user.isVerified) {
    throw new AppError('ALREADY_VERIFIED', 'This account is already verified.', 400);
  }

  await generateAndSendVerificationLink(user);

  return { message: 'Verification link has been resent to your email.' };
}

module.exports = {
  generateAndSendVerificationLink,
  verifyEmailToken,
  resendVerificationLink
};
