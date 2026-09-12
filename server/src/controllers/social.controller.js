const socialService = require('../services/social.service');
const { sendSuccess } = require('../utils/response');

async function getUserProfile(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const profile = await socialService.getUserProfile(req.params.userId, currentUserId);
    return sendSuccess(res, profile, 200);
  } catch (err) {
    next(err);
  }
}

async function searchUsers(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { q, page, limit } = req.query;
    const data = await socialService.searchUsers(q, { page, limit }, currentUserId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function followUser(req, res, next) {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const result = await socialService.followUser(followerId, followingId);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

async function unfollowUser(req, res, next) {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const result = await socialService.unfollowUser(followerId, followingId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

async function getFollowers(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { page, limit } = req.query;
    const data = await socialService.getFollowers(req.params.userId, { page, limit }, currentUserId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

async function getFollowing(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { page, limit } = req.query;
    const data = await socialService.getFollowing(req.params.userId, { page, limit }, currentUserId);
    return sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};
