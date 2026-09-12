const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/rewards', optionalAuthenticate, shopController.getRewards);
router.post('/rewards/:id/redeem', authenticate, shopController.redeemReward);
router.get('/redemptions', authenticate, shopController.getMyRedemptions);

module.exports = router;
