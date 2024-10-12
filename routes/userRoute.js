const router = require("express").Router();
const { getAllUserCtrl, getUserProfileCtrl,UpdateUserCtrl} = require("../controllers/userController");
const { verifyTokenAndAdmin,verifyTokenAndAuth } = require("../middlewares/vertifyToken");
const validateObjectId = require("../middlewares/validateObjectId");


router.route("/profile").get(verifyTokenAndAdmin, getAllUserCtrl)


router.route("/profile/:id")
    .get(validateObjectId, getUserProfileCtrl)
    .put(verifyTokenAndAuth,validateObjectId,UpdateUserCtrl)
module.exports = router;