const Cart = require('../models/cartModel');
const Product = require('../models/proudctModel');
const Checkout= require('../models/checkOutModel')
const asyncHandler = require('express-async-handler');

/**
 * ---------------------------------
 * @desc    Checkout
 * @route   POST /api/cart/checkout
 * @method  POST
 * @access  Private (User must be logged in)
 * ---------------------------------
 */
module.exports.checkout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Fetch the user's cart
    const cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Calculate the total price (after discounts)
    let totalPrice = 0;
    cart.products.forEach(item => {
        const product = item.product;
        const finalPrice = product.discount > 0
            ? product.price - (product.price * (product.discount / 100))
            : product.price;
        totalPrice += item.quantity * finalPrice;
    });

    
    // Update the sold count for each product
    for (const item of cart.products) {
        const product = await Product.findById(item.product._id);

        if (product) {
            // Update sold count
            product.sold += item.quantity;

            // Adjust the stock
            if (product.countInStock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for product: ${product.title}. Only ${product.countInStock} items left.`,
                });
            }
            product.countInStock -= item.quantity;

            await product.save();
        }
    }
    const newCheckout = new Checkout({
        user: userId,
        products: cart.products.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            discount: item.product.discount,
            discountedPrice: item.product.discountedPrice,
        })),
        totalPrice: totalPrice,
        paymentStatus: 'completed', 
    });    
    await newCheckout.save();

    // Clear the cart after successful checkout
    cart.products = [];
    await cart.save();

    res.status(200).json({
        message: 'Checkout successful',
        cart: newCheckout,
        totalPrice,
    });
});



// @desc    Get checkout history for a user
// @route   GET /api/checkout/history
// @access  Private (only logged-in users)
module.exports.getCheckoutHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;  
    
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const checkoutHistory = await Checkout.find({ user: userId }).populate('products.product', 'title price');

    if (!checkoutHistory || checkoutHistory.length === 0) {
        return res.status(404).json({ message: 'No checkout history found for this user' });
    }

    res.status(200).json({
        message: 'Checkout history retrieved successfully',
        checkoutHistory
    });
});