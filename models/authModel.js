const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlenghth: 2,
        maxlenghth: 100

    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlenghth: 5,
        maxlenghth: 100,
        unique: true

    }, password: {
        type: String,
        required: true,
        trim: true,
        minlenghth: 8,
    },  isAdmin: {
        type: Boolean,
        default: false
    },otp: {
        type: Number,
        minlength: 6,
        maxlength: 6,
        required: false
    },
    otpExpire: {
        type: Date,
        required: false
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },

}, {
    timestamps: true
});


UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET);
};
UserSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Static method to compare passwords
UserSchema.statics.comparePassword = async function (inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
};
const User = mongoose.model('User',UserSchema);

function validateRegisterUser(obj){
    const schema = Joi.object({
        username : Joi.string().trim().min(2).max(100).required(),
        email : Joi.string().trim().min(5).max(100).required().email(),
        password : Joi.string().trim().min(8).required(),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required()
    })
    return schema.validate(obj)
}



function validateLoginUser(obj){
    const schema = Joi.object({
        email : Joi.string().trim().min(5).max(100).required().email(),
        password : Joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}

const validateResetPassword = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        newPassword: Joi.string().min(6).required() // validate only newPassword
    });
    return schema.validate(data);
};
function validateUpdateUser(obj){
    const schema = Joi.object({
        username : Joi.string().trim().min(2).max(100),
        email : Joi.string().trim().min(5).max(100).email(),
        password : Joi.string().trim().min(8),
        confirmPassword: Joi.any().valid(Joi.ref('password'))
    })
    return schema.validate(obj)
}


module.exports ={User, validateLoginUser , validateRegisterUser,validateResetPassword,validateUpdateUser};
