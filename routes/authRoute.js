const router = require('express').Router();
const{registerUserCtrl,loginUserCtrl, forgetPasswordCtrl, verifyOtpCtrl, resetPasswordCtrl} = require('../controllers/authController')

router.post("/register", registerUserCtrl)
router.post("/login", loginUserCtrl)
router.post("/forgot-password", forgetPasswordCtrl)
router.post("/verify-otp", verifyOtpCtrl)
router.post("/reset-password", resetPasswordCtrl)


module.exports = router;