const router = require("express").Router();
const { getAllUserCtrl, getUserProfileCtrl} = require("../controllers/userController");
const { verifyTokenAndAdmin } = require("../middlewares/vertifyToken");
const validateObjectId = require("../middlewares/validateObjectId");


router.route("/profile").get(verifyTokenAndAdmin, getAllUserCtrl)


router.route("/profile/:id")
    .get(validateObjectId, getUserProfileCtrl)
module.exports = router;