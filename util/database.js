const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  // SET UP YOUR OWN USER
  let user = 'SET UP YOUR OWN';
  let password = 'SET UP YOUR OWN';

  let url = `mongodb+srv://${user}:${password}@cluster0.nm9ax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  MongoClient.connect(url)
    .then((client) => {
      console.log('worked');
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
