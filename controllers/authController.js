const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateRegisterUser, validateLoginUser, validateResetPassword } = require("../models/authModel")
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/**
 * @desc register
 * @route api/auth/register
 * @method post
 * @access public
 */

module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }


  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  let user = await User.findOne({ email: req.body.email })
  if (user) {
    return res.status(200).json({ message: "User already registered" })
  }


  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  })

  await user.save();
  res.status(201).json({ message: 'User register successfully' })

})

/**-------------------------------
 * @desc login
 * @route api/auth/login
 * @method post
 * @access public
---------------------------------*/

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }


  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" })
  }

  const isPsswoedMatch = await bcrypt.compare(req.body.password, user.password)
  if (!isPsswoedMatch) {
    return res.status(400).json({ message: "invalid email or password" })
  }

  const token = user.generateAuthToken();
  res.status(200).json({
    _id: user._id,
    iaAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,

  })

})



/**********************************
 * @desc forget password
 * @route api/auth/forgot-password
 * @method post
 * @access public
 *********************************/
module.exports.forgetPasswordCtrl = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).send({ message: "Please provide email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .send({ message: "User not found please register" });
    }
    // Generate OTP
    const otp = crypto.randomInt(1000, 9999); // Generates a 4-digit OTP
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const receiver = {
      from: "shrouk26529@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `Your OTP is ${otp}. This OTP will expire in 10 minutes.`,
    };

    await transporter.sendMail(receiver);

    return res.status(200).send({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in forgotPasswordCtrl:", error);
    return res.status(500).send({ message: "Something went wrong" });
  }
});


/**********************************
* @desc verify OTP
* @route api/auth/verify-otp
* @method post
* @access public
*********************************/
module.exports.verifyOtpCtrl = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send({ message: "Please provide email and OTP" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send({ message: "User not found" });
  }

  if (user.otp !== parseInt(otp)) {
    return res.status(400).send({ message: "Invalid OTP" });
  }

  if (user.otpExpire < Date.now()) {
    return res.status(400).send({ message: "OTP has expired" });
  }

  // OTP is valid, allow resetting password
  user.otpVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  return res.status(200).send({ message: "OTP verified, proceed to reset password" });
});


/**********************************
 * @desc reset Password 
 * @route api/auth/reset-password
 * @method post
 * @access public
 *********************************/
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {

  const { error } = validateResetPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).send({ message: "Please provide email and new password" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send({ message: "User not found" });
  }
  if (!user.otpVerified) {
    return res.status(400).send({ message: "OTP verification required before resetting password" });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  user.otpVerified = false;
  await user.save();

  return res.status(200).send({ message: "Password reset successfully" });
});
