const asyncHandler = require('express-async-handler');
const {validateProduct } = require('../models/proudctModel');
const Product = require('../models/proudctModel');

// @desc    Create a new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
module.exports.createProduct = asyncHandler(async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const product = new Product({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        discount: req.body.discount || 0,
        images: req.body.images,
        countInStock: req.body.countInStock,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
module.exports.getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().populate('category', 'name');
    res.status(200).json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
module.exports.getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
});

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
module.exports.updateProduct = asyncHandler(async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );
    res.status(200).json(updatedProduct);
});

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin 
module.exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Use findByIdAndDelete to delete the product
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });

});


module.exports.getBestSellers = asyncHandler(async (req, res) => {
    const bestSellers = await Product.find().sort({ sold: -1 }).limit(1);

    if (!bestSellers || bestSellers.length === 0) {
        return res.status(404).json({ message: 'No best sellers found' });
    }

    // Return the first best seller
    res.status(200).json(bestSellers[0]);
});

module.exports.getOnSaleProducts = asyncHandler(async (req, res) => {
    const onSaleProducts = await Product.find({ discount: { $gt: 0 } }); 
    res.status(200).json(onSaleProducts);
});