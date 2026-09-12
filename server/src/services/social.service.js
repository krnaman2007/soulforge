const prisma = require('../db/prisma');
const { AppError } = require('../utils/errors');
const LevelService = require('./rpg/level.service');

/**
 * Follow a user
 * @param {string} followerId - The authenticated user following
 * @param {string} followingId - The user to be followed
 */
async function followUser(followerId, followingId) {
  // Rule 1: Cannot follow yourself
  if (followerId === followingId) {
    throw new AppError('SELF_FOLLOW_NOT_ALLOWED', 'You cannot follow yourself', 400);
  }

  // Rule 2: Target user must exist
  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true }
  });

  if (!targetUser) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  // Rule 3: Duplicate follow pre-check
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });

  if (existingFollow) {
    throw new AppError('ALREADY_FOLLOWING', 'Already following this user', 409);
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    });

    return {
      message: 'User followed successfully',
      followId: follow.id,
      following: true
    };
  } catch (error) {
    // Handle Prisma race condition with P2002 unique constraint violation
    if (error.code === 'P2002') {
      throw new AppError('ALREADY_FOLLOWING', 'Already following this user', 409);
    }
    throw error;
  }
}

/**
 * Unfollow a user
 * @param {string} followerId - The authenticated user unfollowing
 * @param {string} followingId - The user to be unfollowed
 */
async function unfollowUser(followerId, followingId) {
  if (followerId === followingId) {
    throw new AppError('INVALID_OPERATION', 'You cannot unfollow yourself', 400);
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });

  if (!existingFollow) {
    throw new AppError('NOT_FOLLOWING', 'You are not following this user', 404);
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });

  return {
    message: 'User unfollowed successfully',
    following: false
  };
}

/**
 * Get public profile of a user
 * @param {string} targetUserId - Target profile ID
 * @param {string|null} currentUserId - Authenticated user viewing the profile
 */
async function getUserProfile(targetUserId, currentUserId = null) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      character: {
        select: {
          level: true,
          xp: true,
          currentStreak: true,
          longestStreak: true,
          avatarId: true,
          themeId: true,
          titleId: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const [followersCount, followingCount, followRecord] = await Promise.all([
    prisma.follow.count({
      where: { followingId: targetUserId }
    }),
    prisma.follow.count({
      where: { followerId: targetUserId }
    }),
    currentUserId && currentUserId !== targetUserId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: targetUserId
            }
          }
        })
      : null
  ]);

  const totalXP = LevelService.calculateTotalXP(user.character?.level || 1, user.character?.xp || 0);
  const { rankTitle, tier } = LevelService.getRankTier(totalXP);

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    createdAt: user.createdAt,
    level: user.character?.level || 1,
    xp: totalXP,
    currentStreak: user.character?.currentStreak || 0,
    longestStreak: user.character?.longestStreak || 0,
    avatarId: user.character?.avatarId || 'avatar_starter',
    themeId: user.character?.themeId || 'theme_classic',
    titleId: user.character?.titleId || 'title_apprentice',
    rankTitle,
    tier,
    followersCount,
    followingCount,
    isFollowing: Boolean(followRecord)
  };
}

/**
 * Get users following target user
 */
async function getFollowers(targetUserId, { page = 1, limit = 20 }, currentUserId = null) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true }
  });

  if (!targetUser) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [total, follows] = await Promise.all([
    prisma.follow.count({
      where: { followingId: targetUserId }
    }),
    prisma.follow.findMany({
      where: { followingId: targetUserId },
      skip,
      take: limitNum,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        createdAt: true,
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            character: {
              select: {
                level: true,
                xp: true,
                currentStreak: true,
                avatarId: true,
                titleId: true
              }
            }
          }
        }
      }
    })
  ]);

  const followerIds = follows.map(f => f.follower.id);

  let followedByUserSet = new Set();
  if (currentUserId && followerIds.length > 0) {
    const userFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followerIds }
      },
      select: { followingId: true }
    });
    followedByUserSet = new Set(userFollows.map(f => f.followingId));
  }

  const users = follows.map(f => {
    const totalXP = LevelService.calculateTotalXP(f.follower.character?.level || 1, f.follower.character?.xp || 0);
    const { rankTitle, tier } = LevelService.getRankTier(totalXP);
    return {
      id: f.follower.id,
      name: f.follower.name,
      username: f.follower.username,
      level: f.follower.character?.level || 1,
      xp: totalXP,
      currentStreak: f.follower.character?.currentStreak || 0,
      avatarId: f.follower.character?.avatarId || 'avatar_starter',
      titleId: f.follower.character?.titleId || 'title_apprentice',
      rankTitle,
      tier,
      followedAt: f.createdAt,
      isFollowing: followedByUserSet.has(f.follower.id)
    };
  });

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
}

/**
 * Get users followed by target user
 */
async function getFollowing(targetUserId, { page = 1, limit = 20 }, currentUserId = null) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true }
  });

  if (!targetUser) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [total, follows] = await Promise.all([
    prisma.follow.count({
      where: { followerId: targetUserId }
    }),
    prisma.follow.findMany({
      where: { followerId: targetUserId },
      skip,
      take: limitNum,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        createdAt: true,
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            character: {
              select: {
                level: true,
                xp: true,
                currentStreak: true,
                avatarId: true,
                titleId: true
              }
            }
          }
        }
      }
    })
  ]);

  const followingIds = follows.map(f => f.following.id);

  let followedByUserSet = new Set();
  if (currentUserId && followingIds.length > 0) {
    const userFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followingIds }
      },
      select: { followingId: true }
    });
    followedByUserSet = new Set(userFollows.map(f => f.followingId));
  }

  const users = follows.map(f => {
    const totalXP = LevelService.calculateTotalXP(f.following.character?.level || 1, f.following.character?.xp || 0);
    const { rankTitle, tier } = LevelService.getRankTier(totalXP);
    return {
      id: f.following.id,
      name: f.following.name,
      username: f.following.username,
      level: f.following.character?.level || 1,
      xp: totalXP,
      currentStreak: f.following.character?.currentStreak || 0,
      avatarId: f.following.character?.avatarId || 'avatar_starter',
      titleId: f.following.character?.titleId || 'title_apprentice',
      rankTitle,
      tier,
      followedAt: f.createdAt,
      isFollowing: followedByUserSet.has(f.following.id)
    };
  });

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
}

/**
 * Search users by name or username
 */
async function searchUsers(query, { page = 1, limit = 20 }, currentUserId = null) {
  const normalizedQuery = query.trim();
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where = {
    OR: [
      { name: { contains: normalizedQuery, mode: 'insensitive' } },
      { username: { contains: normalizedQuery, mode: 'insensitive' } }
    ]
  };

  const [total, usersFound] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        username: true,
        character: {
          select: {
            level: true,
            xp: true,
            currentStreak: true,
            avatarId: true,
            titleId: true
          }
        }
      }
    })
  ]);

  const userIds = usersFound.map(u => u.id);

  let followedByUserSet = new Set();
  if (currentUserId && userIds.length > 0) {
    const userFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: userIds }
      },
      select: { followingId: true }
    });
    followedByUserSet = new Set(userFollows.map(f => f.followingId));
  }

  const users = usersFound.map(u => {
    const totalXP = LevelService.calculateTotalXP(u.character?.level || 1, u.character?.xp || 0);
    const { rankTitle, tier } = LevelService.getRankTier(totalXP);
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      level: u.character?.level || 1,
      xp: totalXP,
      currentStreak: u.character?.currentStreak || 0,
      avatarId: u.character?.avatarId || 'avatar_starter',
      titleId: u.character?.titleId || 'title_apprentice',
      rankTitle,
      tier,
      isFollowing: followedByUserSet.has(u.id)
    };
  });

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
}

module.exports = {
  followUser,
  unfollowUser,
  getUserProfile,
  getFollowers,
  getFollowing,
  searchUsers
};
