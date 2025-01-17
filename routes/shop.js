const path = require('path');

const express = require('express');

const shopControllers = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/cart', isAuth, shopControllers.getCart);
router.post('/cart', isAuth, shopControllers.postCart);
router.post('/cart-delete-item', isAuth, shopControllers.postCartDeleteProduct);
router.get('/checkout', isAuth, shopControllers.getCheckout);
router.get('/checkout/success', isAuth, shopControllers.postOrder);
router.get('//checkout/cancel', isAuth, shopControllers.getCheckout);
router.get('/products', shopControllers.getAllProd);
router.get('/products/:productId', shopControllers.getProduct);
router.get('/orders', isAuth, shopControllers.getOrders);
router.post('/create-order', isAuth, shopControllers.postOrder);
router.get('/orders/:orderId', isAuth, shopControllers.getInvoice);
router.get('/', shopControllers.getIndex);

module.exports = router;
