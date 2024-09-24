const router = require('express').Router();
const { CreateCategoryCtrl, getAllCategoryCtrl } = require('../controllers/categoriesController');
const {vertifyToken, verifyTokenAndAdmin} = require('../middlewares/vertifyToken')

router.route("/")
 .post(verifyTokenAndAdmin,CreateCategoryCtrl)
 .get(getAllCategoryCtrl)

module.exports = router;