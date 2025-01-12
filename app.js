const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('6783e26d5277ae2fc3b743e1')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

//conecting to database

let user = 'SET UP YOUR OWN';
let password = 'SET UP YOUR OWN';

let url = `mongodb+srv://${user}:${password}@cluster0.nm9ax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(url)
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({ name: 'Emil', email: 'test@test.com', cart: { items: [] } });
        user.save();
      }
    });
    console.log('CONNECTED');
    app.listen(3000);
  })
  .catch((err) => console.log(err));
