const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
const env = require('../../config/env');
const { RPG_CONSTANTS } = require('../../config/constants');
const { AppError } = require('../../utils/errors');
const verificationService = require('./verification.service');

const BCRYPT_SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'soulforge',
  'support',
  'system',
  'mod',
  'moderator',
  'help',
  'api',
  'root',
  'null',
  'undefined'
]);

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

async function register({ name, email, password, username }) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  if (RESERVED_USERNAMES.has(normalizedUsername)) {
    throw new AppError('RESERVED_USERNAME', 'This username is reserved and cannot be used', 400);
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingEmail) {
    throw new AppError('EMAIL_ALREADY_EXISTS', 'A user with this email already exists', 409);
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: normalizedUsername }
  });

  if (existingUsername) {
    throw new AppError('USERNAME_ALREADY_EXISTS', 'This username is already taken', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        isVerified: false
      }
    });

    const character = await tx.character.create({
      data: {
        userId: user.id,
        level: RPG_CONSTANTS.STARTER_STATS.LEVEL,
        xp: RPG_CONSTANTS.STARTER_STATS.XP,
        coins: RPG_CONSTANTS.STARTER_STATS.COINS,
        strength: RPG_CONSTANTS.STARTER_STATS.DEFAULT_ATTRIBUTE_VALUE,
        intellect: RPG_CONSTANTS.STARTER_STATS.DEFAULT_ATTRIBUTE_VALUE,
        discipline: RPG_CONSTANTS.STARTER_STATS.DEFAULT_ATTRIBUTE_VALUE,
        health: RPG_CONSTANTS.STARTER_STATS.DEFAULT_ATTRIBUTE_VALUE,
        creativity: RPG_CONSTANTS.STARTER_STATS.DEFAULT_ATTRIBUTE_VALUE,
        social: RPG_CONSTANTS.STARTER_STATS.DEFAULT_ATTRIBUTE_VALUE,
        currentStreak: 0,
        longestStreak: 0,
        avatarId: RPG_CONSTANTS.STARTER_STATS.AVATAR_ID,
        themeId: RPG_CONSTANTS.STARTER_STATS.THEME_ID,
        titleId: RPG_CONSTANTS.STARTER_STATS.TITLE_ID
      }
    });

    return { user, character };
  });

  // Send verification link instead of generating JWT token
  await verificationService.generateAndSendVerificationLink(result.user);

  return {
    message: 'Registration successful. Please check your email for a verification link.',
    user: sanitizeUser(result.user),
    character: result.character,
    needsUsername: false
  };
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { character: true }
  });

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('ACCOUNT_NOT_VERIFIED', 'Please verify your email address to log in', 403);
  }

  const token = generateToken({
    id: user.id,
    email: user.email
  });

  return {
    token,
    user: sanitizeUser(user),
    character: user.character,
    needsUsername: !user.username
  };
}

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { character: true }
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User profile not found', 404);
  }

  return {
    user: sanitizeUser(user),
    character: user.character,
    needsUsername: !user.username
  };
}

async function checkUsernameAvailability(rawUsername) {
  if (!rawUsername || typeof rawUsername !== 'string') {
    throw new AppError('VALIDATION_ERROR', 'Username is required', 400);
  }

  const normalized = rawUsername.toLowerCase().trim();

  if (!USERNAME_REGEX.test(normalized)) {
    return {
      available: false,
      username: normalized,
      reason: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
    };
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      available: false,
      username: normalized,
      reason: 'This username is reserved'
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalized }
  });

  return {
    available: !existing,
    username: normalized,
    reason: existing ? 'Username is already taken' : undefined
  };
}

async function setUsername(userId, rawUsername) {
  if (!rawUsername || typeof rawUsername !== 'string') {
    throw new AppError('VALIDATION_ERROR', 'Username is required', 400);
  }

  const normalized = rawUsername.toLowerCase().trim();

  if (!USERNAME_REGEX.test(normalized)) {
    throw new AppError('INVALID_USERNAME', 'Username must be 3-30 characters long and contain only letters, numbers, and underscores', 400);
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    throw new AppError('RESERVED_USERNAME', 'This username is reserved and cannot be used', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { character: true }
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const existing = await prisma.user.findUnique({
    where: { username: normalized }
  });

  if (existing && existing.id !== userId) {
    throw new AppError('USERNAME_ALREADY_EXISTS', 'This username is already taken', 409);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { username: normalized },
    include: { character: true }
  });

  return {
    user: sanitizeUser(updatedUser),
    character: updatedUser.character,
    needsUsername: false
  };
}

module.exports = {
  register,
  login,
  getCurrentUser,
  checkUsernameAvailability,
  setUsername
};

