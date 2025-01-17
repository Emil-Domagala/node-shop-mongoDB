const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminControllers = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const validationOfProduct = [
  body('title', 'title should be at least 3 char long and alphanumeric').isLength({ min: 3 }).isString().trim(),
  body('price', 'price should be decimal').isFloat(),
  body('description', 'desc should be at least 5 char and less then 254').isLength({ min: 5, max: 254 }).trim(),
];

router.get('/add-product', isAuth, adminControllers.getAddProduct);
router.get('/products', isAuth, adminControllers.getProducts);
router.post('/add-product', validationOfProduct, isAuth, adminControllers.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminControllers.getEditProduct);
router.post('/edit-product', validationOfProduct, isAuth, adminControllers.postEditProduct);


router.delete('/product/:productId',isAuth ,adminControllers.deleteProduct);

module.exports = router;
