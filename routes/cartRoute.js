const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCart, removeFromCart, checkout } = require('../controllers/cartController');
const {vertifyToken, verifyTokenOnlyUser} = require('../middlewares/vertifyToken')
const validateObjectId = require("../middlewares/validateObjectId");


router.route('/')
.post( verifyTokenOnlyUser,addToCart)
.get( verifyTokenOnlyUser,getCart);

router.route('/:productId')
.put(verifyTokenOnlyUser,updateCart)
.delete(verifyTokenOnlyUser,removeFromCart);


module.exports = router;
