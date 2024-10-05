const mongoose = require('mongoose');

const CheckoutSchema = new mongoose.Schema({
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
            },
            price: {
                type: Number,
                required: true,
            },   discount: {
                type: Number,
                default: 0, 
                min: 0,
                max: 100, 
            },
            discountedPrice: {
                type: Number,
                min: 0,
            }
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    checkoutDate: {
        type: Date,
        default: Date.now,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    }
}, {
    timestamps: true,
});

const Checkout = mongoose.model('Checkout', CheckoutSchema);
module.exports = Checkout;
