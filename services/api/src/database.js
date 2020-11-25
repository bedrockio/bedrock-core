const config = require('@bedrockio/config');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

exports.init = async () => {
  await mongoose.connect(config.get('MONGO_URI'), {
    // The underlying MongoDB driver has deprecated their current connection string parser.
    useNewUrlParser: true,
    // Make Mongoose's default index build use createIndex() instead of ensureIndex()
    // to avoid deprecation warnings from the MongoDB driver
    useCreateIndex: true,
    // To opt in to using the MongoDB driver's new connection management engine.
    // https://mongoosejs.com/docs/deprecations.html#useunifiedtopology
    useUnifiedTopology: true,
    // Set to false to make findOneAndUpdate() and findOneAndRemove()
    // use native findOneAndUpdate() rather than findAndModify()
    useFindAndModify: false,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.info('mongodb connected');
  });
  return db;
};
