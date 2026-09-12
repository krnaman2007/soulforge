const { Router } = require('express');
const socialController = require('../controllers/social.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const { validateParams, validateQuery } = require('../middleware/validation.middleware');
const {
  userIdParamSchema,
  paginationQuerySchema,
  searchQuerySchema
} = require('../schemas/social.schema');

const router = Router();

// 1. Search adventurers (Static route MUST precede /:userId)
router.get(
  '/search',
  optionalAuthenticate,
  validateQuery(searchQuerySchema),
  socialController.searchUsers
);

// 2. Public profile
router.get(
  '/:userId',
  optionalAuthenticate,
  validateParams(userIdParamSchema),
  socialController.getUserProfile
);

// 3. Follow user (Authenticated only)
router.post(
  '/:userId/follow',
  authenticate,
  validateParams(userIdParamSchema),
  socialController.followUser
);

// 4. Unfollow user (Authenticated only)
router.delete(
  '/:userId/follow',
  authenticate,
  validateParams(userIdParamSchema),
  socialController.unfollowUser
);

// 5. Followers list
router.get(
  '/:userId/followers',
  optionalAuthenticate,
  validateParams(userIdParamSchema),
  validateQuery(paginationQuerySchema),
  socialController.getFollowers
);

// 6. Following list
router.get(
  '/:userId/following',
  optionalAuthenticate,
  validateParams(userIdParamSchema),
  validateQuery(paginationQuerySchema),
  socialController.getFollowing
);

module.exports = router;
