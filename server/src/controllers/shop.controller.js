const rewardService = require('../services/reward.service');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

exports.getRewards = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      rarity: req.query.rarity,
    };
    const rewards = await rewardService.getAllRewards(filters);
    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    logger.error('Error fetching rewards', { error: error.message });
    next(error);
  }
};

exports.redeemReward = async (req, res, next) => {
  try {
    const { id: rewardId } = req.params;
    const userId = req.user.id;

    if (!rewardId) {
      throw new AppError('VALIDATION_ERROR', 'Reward ID is required', 400);
    }

    const redemption = await rewardService.redeemReward(userId, rewardId);

    res.status(200).json({
      success: true,
      message: 'Reward successfully redeemed',
      data: redemption,
    });
  } catch (error) {
    logger.error('Error redeeming reward', { error: error.message, userId: req.user.id, rewardId: req.params.id });
    next(error);
  }
};

exports.getMyRedemptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const redemptions = await rewardService.getUserRedemptions(userId);

    res.status(200).json({
      success: true,
      data: redemptions,
    });
  } catch (error) {
    logger.error('Error fetching redemptions', { error: error.message, userId: req.user.id });
    next(error);
  }
};
