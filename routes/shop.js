const path = require('path');

const express = require('express');

const shopControllers = require('../controllers/shop');

const router = express.Router();

router.get('/cart', shopControllers.getCart);
router.post('/cart', shopControllers.postCart);
router.post('/cart-delete-item', shopControllers.postCartDeleteProduct);
// router.get('/checkout', shopControllers.getCheckout);
router.get('/products', shopControllers.getAllProd);
router.get('/products/:productId', shopControllers.getProduct);
router.get('/orders', shopControllers.getOrders);
router.post('/create-order', shopControllers.postOrder);
router.get('/', shopControllers.getIndex);

module.exports = router;
