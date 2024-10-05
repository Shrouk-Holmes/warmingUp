const mongoose = require('mongoose');
const Joi = require('joi');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,  
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10, 
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0, 
    },
    discount: {
        type: Number,
        default: 0, 
        min: 0,
        max: 100, 
    },
    discountedPrice: {
        type: Number,
        min: 0,
    },
    image:[{
        type: Object,
        default:{
         url :"",
         pubicId : null,
        }
     }],
    countInStock: {
        type: Number,
        required: true,
        min: 0, 
    },
    sold: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true, 
});

// Automatically calculate the discounted price before saving
ProductSchema.pre('save', function (next) {
    if (this.discount > 0) {
        this.discountedPrice = this.price - (this.price * (this.discount / 100));
    } else {
        this.discountedPrice = this.price;
    }
    next();
});

const Product = mongoose.model('Product', ProductSchema);

// Move the validateProduct function outside the module.exports
function validateProduct(product) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(200).required(),
        description: Joi.string().min(10).required(),
        category: Joi.string().required(),
        price: Joi.number().min(0).required(),
        discount: Joi.number().min(0).max(100),
        countInStock: Joi.number().min(0).required(),
    });

    return schema.validate(product);
}

function validateProductPartial(product) {
    const schema = Joi.object({
        title: Joi.string().optional(),  // Make title optional for partial updates
        description: Joi.string().optional(),
        category: Joi.string().optional(),
        price: Joi.number().optional(),
        discount: Joi.number().optional(),
        countInStock: Joi.number().optional(),
        imagesToDelete: Joi.array().optional(), // Optional array for images to delete
    });

    return schema.validate(product);
}
// Export the model directly
module.exports = Product;

// If you still want to export the validate function, do it like this:
module.exports.validateProduct = validateProduct;
module.exports.validateProductPartial = validateProductPartial;
