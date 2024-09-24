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
    res.status(200).json(users)
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
