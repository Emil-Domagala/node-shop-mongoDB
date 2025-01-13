const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

/////////////////////////

let user = 'SET UP YOUR OWN';
let password = 'SET UP YOUR OWN';
user = encodeURIComponent('emildomagalaa');
password = encodeURIComponent('Node-Shop');

const MONGODB_URI = `mongodb+srv://${user}:${password}@cluster0.nm9ax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

//////////////////////////

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false, store: store }));
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      req.next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

//conecting to database

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('CONNECTED');
    app.listen(3000);
  })
  .catch((err) => console.log(err));
