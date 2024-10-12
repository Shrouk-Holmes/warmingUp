const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { User} = require("../models/authModel");

/**---------------------------------
 * @desc get all users profile
 * @route api/users/profile
 * @method GET
 * @access private (onlyAdmin)
 -----------------------------------*/

 module.exports.getAllUserCtrl = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    const userCount = await User.countDocuments();  // Count total users

    res.status(200).json({
        totalUsers: userCount,
        users})
})

/**---------------------------------
* @desc get user profile
* @route api/users/profile/:id
* @method GET
* @access public
-----------------------------------*/


module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
})


/**---------------------------------
 * @desc    Update user profile
 * @route   PUT /api/users/profile/:id
 * @method  PUT
 * @access  Private (user or admin)
 -----------------------------------*/
module.exports.UpdateUserCtrl = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Find the user by ID
    let user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check for input validation errors (you might already have validation logic)
    const { error } = validateUpdateUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Only update password if provided, and hash it before saving
    if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
    }

    // Update user fields (only those provided)
    user = await User.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                username: username || user.username,
                email: email || user.email,
                password: req.body.password || user.password,
            },
        },
        { new: true, runValidators: true }
    );

    // Return updated user data, excluding the password
    res.status(200).json({
        message: "User updated successfully",
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
        },
    });
});
