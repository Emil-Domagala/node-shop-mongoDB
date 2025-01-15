const Product = require('../models/product');
const { validationResult } = require('express-validator');

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Detail',
      path: '/admin/edit-product',
      product: { title, imageUrl, price, description },
      hasError: true,
      editing: false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({ title, price, description, imageUrl, userId: req.user._id });
  product
    .save()
    .then(() => res.redirect('/admin/products'))
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect('/');
    return;
  }

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        res.redirect('/');
        return;
      }
      res.render('admin/edit-product', {
        product: product,
        pageTitle: 'Edit Detail',
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('/////////////////////////////');
    console.log(errors.array());
    console.log('/////////////////////////////');
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        _id: id,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() != req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save().then(() => {
        res.redirect('/admin/products');
      });
    })

    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
