const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../../db/prisma');
const env = require('../../config/env');
const { RPG_CONSTANTS } = require('../../config/constants');
const { AppError } = require('../../utils/errors');
const logger = require('../../errorlogging/logger');

const JWT_EXPIRES_IN = '7d';

let googleClient = null;

function getGoogleClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }
  return googleClient;
}

function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

const GOOGLE_PLAYGROUND_CLIENT_ID = '407408718192.apps.googleusercontent.com';

async function verifyGoogleToken(idToken) {
  const client = getGoogleClient();

  try {
    // If GOOGLE_CLIENT_ID is configured, verify signature directly with audience check
    if (env.GOOGLE_CLIENT_ID) {
      const allowedAudiences = [env.GOOGLE_CLIENT_ID];

      // In development, also accept tokens generated via Google OAuth 2.0 Playground for testing
      if (env.NODE_ENV === 'development') {
        allowedAudiences.push(GOOGLE_PLAYGROUND_CLIENT_ID);
      }

      const ticket = await client.verifyIdToken({
        idToken,
        audience: allowedAudiences
      });
      return ticket.getPayload();
    }

    // Fallback: Verify via Google TokenInfo endpoint if client ID is not configured locally
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      throw new Error('Google token verification endpoint returned error');
    }
    const payload = await response.json();
    return payload;
  } catch (error) {
    logger.error(`[GOOGLE AUTH] Token verification failed: ${error.message}`);
    throw new AppError('INVALID_GOOGLE_TOKEN', 'Google authentication token is invalid or expired', 401);
  }
}

async function loginWithGoogle({ idToken }) {
  if (!idToken) {
    throw new AppError('VALIDATION_ERROR', 'Google idToken is required', 400);
  }

  const payload = await verifyGoogleToken(idToken);

  if (!payload || !payload.email) {
    throw new AppError('INVALID_GOOGLE_TOKEN', 'Could not retrieve email from Google profile', 400);
  }

  const email = payload.email.toLowerCase().trim();
  const name = payload.name || payload.given_name || email.split('@')[0];
  const googleId = payload.sub;

  // 1. Check if user with this googleId already exists
  let user = await prisma.user.findFirst({
    where: { googleId },
    include: { character: true }
  });

  // 2. If not found by googleId, check by email
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
      include: { character: true }
    });

    if (user) {
      // Link existing user account to Google ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, isVerified: true },
        include: { character: true }
      });
    }
  }

  let isNewUser = false;

  // 3. If user still doesn't exist, create new user + character atomically
  if (!user) {
    isNewUser = true;

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          googleId,
          passwordHash: null,
          isVerified: true
        }
      });

      const newCharacter = await tx.character.create({
        data: {
          userId: newUser.id,
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

      return { user: newUser, character: newCharacter };
    });

    user = {
      ...result.user,
      character: result.character
    };
  }

  const token = generateToken({
    id: user.id,
    email: user.email
  });

  return {
    token,
    user: sanitizeUser(user),
    character: user.character,
    isNewUser,
    needsUsername: !user.username
  };
}

module.exports = {
  loginWithGoogle
};
