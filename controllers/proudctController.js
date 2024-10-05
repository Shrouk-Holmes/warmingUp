const fs = require("fs")
const path = require("path");
const asyncHandler = require('express-async-handler');
const {validateProduct,validateProductPartial } = require('../models/proudctModel');
const Product = require('../models/proudctModel');
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImages } = require("../utils/cloudinary");
const mongoose = require('mongoose');

// @desc    Create a new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
module.exports.createProduct = asyncHandler(async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
    }

    // Array to store image URLs and public IDs
    const image = [];

    // Iterate over each uploaded file and upload to Cloudinary
    for (const file of req.files) {
        const imagePath = path.join(__dirname, `../images/${file.filename}`);
        const result = await cloudinaryUploadImage(imagePath);
        
        // Push the image data to the images array
        image.push({
            url: result.secure_url,
            publicId: result.public_id
        });

        // Remove the image from local after uploading
        fs.unlinkSync(imagePath);
    }

    const product = new Product({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        discount: req.body.discount || 0,
        countInStock: req.body.countInStock,
        image: image
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
module.exports.getAllProducts = asyncHandler(async (req, res) => {
    const categoryId = req.query.category;

    let filter = {};

    // Validate the categoryId format
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }

    if (categoryId) {
        filter.category = categoryId;
    }

    const products = await Product.find(filter).populate('category', 'name');

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
    const { error } = validateProductPartial(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Find the product
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    let updatedImages = [...product.image]; // Start with existing images

    // Handle deletion of selected images
    if (req.body.imagesToDelete && req.body.imagesToDelete.length > 0) {
        const imagesToDelete = req.body.imagesToDelete;

        // Remove selected images from Cloudinary
        await cloudinaryRemoveMultipleImages(imagesToDelete);

        // Remove selected images from the product
        updatedImages = updatedImages.filter(img => !imagesToDelete.includes(img.publicId));
    }

    // Handle new images upload only if files are provided
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const imagePath = path.join(__dirname, `../images/${file.filename}`);
            const result = await cloudinaryUploadImage(imagePath);
            updatedImages.push({
                url: result.secure_url,
                publicId: result.public_id,
            });

            // Remove the file after uploading
            fs.unlinkSync(imagePath);
        }
    }

    // Create an updated product data object
    const updatedProductData = {
        ...req.body,
        image: updatedImages, // Use the updated images array
    };

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updatedProductData },
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
    for (const image of product.image) {
        await cloudinaryRemoveMultipleImages(image.publicId);
    }
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