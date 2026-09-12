const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/rewards', shopController.getRewards);
router.post('/rewards/:id/redeem', shopController.redeemReward);
router.get('/redemptions', shopController.getMyRedemptions);

module.exports = router;
