const path = require('path');

const express = require('express');

const shopControllers = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/cart', isAuth, shopControllers.getCart);
router.post('/cart', isAuth, shopControllers.postCart);
router.post('/cart-delete-item', isAuth, shopControllers.postCartDeleteProduct);
// router.get('/checkout', shopControllers.getCheckout);
router.get('/products', shopControllers.getAllProd);
router.get('/products/:productId', shopControllers.getProduct);
router.get('/orders', isAuth, shopControllers.getOrders);
router.post('/create-order', isAuth, shopControllers.postOrder);
router.get('/', shopControllers.getIndex);

module.exports = router;
