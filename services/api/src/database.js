const config = require('@kaareal/config');
const mongoose = require('mongoose');

mongoose.Promise = Promise;

module.exports = async () => {
  await mongoose.connect(config.get('MONGO_URI'), {
    // useNewUrlParser: The underlying MongoDB driver has deprecated their current connection string parser.
    useNewUrlParser: true,
    // useCreateIndex: make Mongoose's default index build use createIndex() instead of ensureIndex()
    // to avoid deprecation warnings from the MongoDB driver
    useCreateIndex: true,
    // useUnifiedTopology: To opt in to using the MongoDB driver's new connection management engine.
    // https://mongoosejs.com/docs/deprecations.html#useunifiedtopology
    useUnifiedTopology: true,
    // useFindAndModify: Set to false to make findOneAndUpdate() and findOneAndRemove()
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
