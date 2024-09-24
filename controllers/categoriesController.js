const asyncHandler = require('express-async-handler');
const { Category, validateCreateCategory } = require('../models/categoryModel')
const { User } = require('../models/authModel');


/**
 * @desc Create a new category
 * @route POST /api/categories
 * @access Private/Admin
 */

module.exports.CreateCategoryCtrl = asyncHandler(async (req, res) => {
    const { error } = validateCreateCategory(req.body);
    if (error) {
        return res.status(404).json({ message: error.details[0].message });
    }
    const existingCategory = await Category.findOne({ title: req.body.title });
    if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
    }


    const category = await Category.create({
        title: req.body.title,
        user: req.user._id,
    })
    res.status(201).json(category);
})


/**---------------------------------
* @desc get all categories 
* @route api/categories
* @method Get
* @access private (only admin )
-----------------------------------*/
module.exports.getAllCategoryCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find().populate('user', 'username');
    res.status(200).json(categories);
})

