const express = require('express');
const router = express.Router();

const { verifyTokenOnlyUser, verifyTokenAndAuth} = require('../middlewares/vertifyToken');
const { checkout, getCheckoutHistory } = require('../controllers/checkOutController');

router.route('/checkout').post(verifyTokenOnlyUser, checkout);
router.get('/history',verifyTokenAndAuth, getCheckoutHistory);

module.exports = router;
