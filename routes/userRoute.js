const router = require("express").Router();
const { getAllUserCtrl, getUserProfileCtrl,UpdateUserCtrl} = require("../controllers/userController");
const { verifyTokenAndAdmin,verifyTokenAndAuth ,verifyTokenOnlyUser, vertifyToken} = require("../middlewares/vertifyToken");
const validateObjectId = require("../middlewares/validateObjectId");


router.route("/profile").get(verifyTokenAndAdmin, getAllUserCtrl)


router.route("/profile/:id")
    .get(validateObjectId, getUserProfileCtrl)
    .put(validateObjectId,verifyTokenOnlyUser,UpdateUserCtrl)
module.exports = router;