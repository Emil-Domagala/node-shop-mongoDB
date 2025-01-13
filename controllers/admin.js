const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedInn,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
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
        isAuthenticated: req.session.isLoggedInn,
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
  Product.findByIdAndUpdate(id, { title, price, description, imageUrl })
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productId;

  Product.findByIdAndDelete(id)
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => console.log(err));
};
