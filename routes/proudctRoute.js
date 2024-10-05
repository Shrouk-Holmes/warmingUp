const express = require('express');
const { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct, 
    getBestSellers,
    getOnSaleProducts
} = require('../controllers/proudctController');
const { verifyTokenAndAdmin } = require('../middlewares/vertifyToken');
const validateObjectId = require('../middlewares/validateObjectId');
const router = express.Router();
const photoUpload = require("../middlewares/photoUpload");


router.route('/')
.post(verifyTokenAndAdmin,photoUpload.array("image",6), createProduct)
.get(getAllProducts);

router.get('/best-sellers', getBestSellers);
router.get('/on-sale', getOnSaleProducts);

router.route('/:id')
.get(getProductById)
.put(validateObjectId,verifyTokenAndAdmin,photoUpload.array("image",6), updateProduct)
.delete(validateObjectId,verifyTokenAndAdmin, deleteProduct);

module.exports = router;
