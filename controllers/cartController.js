const Cart = require('../models/cartModel');
const Product = require('../models/proudctModel');
const asyncHandler = require('express-async-handler');

/**
 * ---------------------------------
 * @desc    Add a product to the cart
 * @route   POST /api/cart
 * @method  POST
 * @access  Private (User must be logged in)
 * ---------------------------------
 */
module.exports.addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate the price after applying the discount
    const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, products: [] });
    }

    // Check if the product already exists in the cart
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

    if (productIndex > -1) {
        // Product exists, update the quantity to the value from the request
        cart.products[productIndex].quantity = quantity; // Replace the quantity
    } else {
        // Add new product to the cart
        cart.products.push({ product: productId, quantity, price: discountedPrice });
    }
    await cart.save();

    res.status(200).json({ message: 'Product added to cart', cart });
});

/**
 * ---------------------------------
 * @desc    Get the cart for the logged-in user
 * @route   GET /api/cart
 * @method  GET
 * @access  Private (User must be logged in)
 * ---------------------------------
 */
module.exports.getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;    
    // Fetch the user's cart with populated product details
    const cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart) {
        return res.status(404).json({ message: 'Cart is empty' });
    }

    // Calculate the total price (after discounts)
    let totalPrice = 0;
    cart.products.forEach(item => {
        totalPrice += item.quantity * item.price;
    });

    res.status(200).json({
        cart,
        totalPrice,
    });
});

/**
 * ---------------------------------
 * @desc    Update the quantity of a product in the cart
 * @route   PUT /api/cart/:productId
 * @method  PUT
 * @access  Private (User must be logged in)
 * ---------------------------------
 */
module.exports.updateCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const { quantity } = req.body;
    const userId = req.user._id;
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }

    // Check if the product exists in the cart
    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex > -1) {
        // Update the quantity if product exists
        cart.products[productIndex].quantity = quantity;

        await cart.save();
        return res.status(200).json({ message: 'Cart updated', cart });
    } else {
        return res.status(404).json({ message: 'Product not found in cart' });
    }
});

/**
 * ---------------------------------
 * @desc    Remove a product from the cart
 * @route   DELETE /api/cart/:productId
 * @method  DELETE
 * @access  Private (User must be logged in)
 * ---------------------------------
 */
module.exports.removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter out the product from the cart
    cart.products = cart.products.filter(p => p.product.toString() !== productId);

    await cart.save();

    res.status(200).json({ message: 'Product removed from cart', cart });
});

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
            product.sold += item.quantity; 
            await product.save();
        }
    }
    
    // Clear the cart after successful checkout
    cart.products = [];
    await cart.save();
    
    res.status(200).json({
        message: 'Checkout successful',
        totalPrice,
    });
});
