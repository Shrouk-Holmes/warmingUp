const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number, // Store the discounted price of the product at the time of adding to cart
                required: true,
            },
        },
    ],
}, {
    timestamps: true,
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
