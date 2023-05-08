const { MongoClient } = require('mongodb');

let dbConnection;

const URI = "mongodb+srv://ananddeepsingh:test1234@cluster0.mvleufo.mongodb.net/bookstore?retryWrites=true&w=majority";

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(URI)
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch(err => {
        console.log(err);
        return cb(err);
      })
  },
  getDb: () => dbConnection

}
