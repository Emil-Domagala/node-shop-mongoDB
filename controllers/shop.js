const STRIPE_KEY = require('../util/API_KEYS').STRIPE_KEY;
const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const product = require('../models/product');

const Stripe_secret_KEY = STRIPE_KEY.STRIPE_SECRET_KEY;
const Stripe_public_KEY = STRIPE_KEY.STRIPE_PUBLIC_KEY;

const stripe = require('stripe')(Stripe_secret_KEY);

const ITEMS_PER_PAGE = 3;

const handleError = (err, next) => {
  console.log(err);
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        hasPreviousPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        nextPage: page + 1,
        previousPage: page - 1,
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => handleError(err, next));
};

exports.getAllProd = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        hasPreviousPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        nextPage: page + 1,
        previousPage: page - 1,
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => handleError(err, next));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        products: products,
        pageTitle: 'Your Cart',
        path: '/cart',
      });
    })
    .catch((err) => handleError(err, next));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => handleError(err, next));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleleItemFromCart(prodId)
    .then(() => res.redirect('/'))
    .catch((err) => handleError(err, next));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: 'Product Detail',
        path: '/products',
      });
    })
    .catch((err) => handleError(err, next));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        orders: orders,
        pageTitle: 'Your Orders',
        path: '/orders',
      });
    })
    .catch((err) => handleError(err, next));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return { quantity: item.quantity, product: { ...item.productId._doc } };
      });
      const order = new Order({
        products: products,
        user: { userId: user._id, email: user.email },
      });
      order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => res.redirect('/orders'))
    .catch((err) => handleError(err, next));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');

      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Invoice');
      pdfDoc.text('-------------------------');
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.product.price * prod.quantity;
        pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
      });
      pdfDoc.text('-------------------------');
      pdfDoc.text('Total Price: $' + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => handleError(err, next));
};

exports.getCheckout = (req, res, next) => {
  let products;
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      products = user.cart.items;
      products.forEach((prod) => (totalSum += prod.quantity * prod.productId.price));

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: products.map((p) => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: 'usd',
              product_data: {
                name: p.productId.title,
              },
              unit_amount: Math.round(p.productId.price * 100),
            },
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/' + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/' + '/checkout/cancel',
      });
    })
    .then((session) => {
      return res.render('shop/checkout', {
        products: products,
        pageTitle: 'Your checkout',
        path: '/checkout',
        totalSum: totalSum,
        sessionId: session.id,
        Stripe_public_KEY: Stripe_public_KEY,
      });
    })
    .catch((err) => console.log(err));
};
