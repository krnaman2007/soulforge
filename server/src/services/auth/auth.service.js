const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
const env = require('../../config/env');
const { RPG_CONSTANTS } = require('../../config/constants');
const { AppError } = require('../../utils/errors');

const BCRYPT_SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    throw new AppError('EMAIL_ALREADY_EXISTS', 'A user with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash
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

  const token = generateToken({
    id: result.user.id,
    email: result.user.email
  });

  return {
    token,
    user: sanitizeUser(result.user),
    character: result.character
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

  const token = generateToken({
    id: user.id,
    email: user.email
  });

  return {
    token,
    user: sanitizeUser(user),
    character: user.character
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
    character: user.character
  };
}

module.exports = {
  register,
  login,
  getCurrentUser
};
