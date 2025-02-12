const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: { type: String, required: false },
  resetTokenExpiration: { type: Date, required: false },
  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true },
        quantity: { type: Number, require: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() == product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }

  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleleItemFromCart = function (prodId) {
  const updatedCart = this.cart.items.filter((item) => {
    return prodId.toString() != item.productId.toString();
  });

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db
//       .collection('users')
//       .insertOne(this)
//       .then()
//       .catch((err) => console.log(err));
//   }

//   addToCart(product) {
//     const db = getDb();

//     const cartProductIndex = this.cart.items.findIndex((item) => {
//       return item.productId.toString() == product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
//     }

//     const updatedCart = { items: updatedCartItems };
//     db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((item) => {
//       return item.productId;
//     });
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((prod) => {
//           return {
//             ...prod,
//             quantity: this.cart.items.find((item) => {
//               return item.productId.toString() == prod._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .find({ _id: new mongodb.ObjectId(userId) })
//       .next()
//       .then((user) => user)
//       .catch((err) => console.log(err));
//   }

//   deleleItemFromCart(prodId) {
//     const db = getDb();

//     const updatedCart = this.cart.items.filter((item) => {
//       return prodId.toString() != item.productId.toString();
//     });

//     return db
//       .collection('users')
//       .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCart } } });
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: { _id: new mongodb.ObjectId(this._id), username: this.username, email: this.email },
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       .then((res) => {
//         this.cart = { items: [] };
//         return db
//           .collection('users')
//           .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': new mongodb.ObjectId(this._id) })
//       .toArray();
//   }
// }

// module.exports = User;
