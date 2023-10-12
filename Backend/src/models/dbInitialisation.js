const mongoose = require('mongoose');

/**
 *
 * @param {string} mongoDBUrl - mongodb connection url
 */
function dbInit(mongoDBUrl) {
  mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;

  db.on('error', (error) => {
    console.error('MongoDB connection error occured', error.message);
    process.exit(1);
  });

  db.once('open', () => {
    console.log('Connected to MongoDB');
  });

  //   db.on('disconnected', () => {
  //     console.log('MongoDB disconnected. Attempting to reconnect...');
  //     mongoose.connect(mongoDBURL, {
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //     });
  //   });

  // Handle Node.js process termination to close the MongoDB connection
  process.on('SIGINT', () => {
    mongoose.connection.close();
  });
}

module.exports = {dbInit};
