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


router.route('/')
.post(verifyTokenAndAdmin, createProduct)
.get(getAllProducts);

router.get('/best-sellers', getBestSellers);
router.get('/on-sale', getOnSaleProducts);

router.route('/:id')
.get(getProductById)
.put(validateObjectId,verifyTokenAndAdmin, updateProduct)
.delete(validateObjectId,verifyTokenAndAdmin, deleteProduct);

module.exports = router;
