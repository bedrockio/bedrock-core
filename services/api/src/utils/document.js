const mongoose = require('mongoose');

// Mongoose provides an "equals" method on both documents and
// ObjectIds, however it does not provide a static method to
// compare two unknown values that may be either, so provide
// it here.
function isEqual(a, b) {
  if (a === b) {
    return true;
  } else if (a instanceof mongoose.Document) {
    return a.equals(b);
  } else if (b instanceof mongoose.Document) {
    return b.equals(a);
  } else if (a instanceof mongoose.Types.ObjectId) {
    return a.equals(b);
  } else if (b instanceof mongoose.Types.ObjectId) {
    return b.equals(a);
  } else {
    return false;
  }
}

module.exports = {
  isEqual,
};
