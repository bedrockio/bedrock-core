const { omit } = require('lodash');
const mongoose = require('mongoose');
const Schema = require('../utils/Schema');

const schema = new Schema(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    storageType: { type: String, required: true },
    rawUrl: { type: String, required: true },
    hash: { type: String, required: true },
    ownerId: { type: String, required: true },
    thumbnailUrl: { type: String },
  },
);

schema.methods.assign = function assign(fields) {
  Object.assign(this, omit(fields, ['createdAt', 'updatedAt', 'deletedAt', 'id']));
};

module.exports = mongoose.models.Upload || mongoose.model('Upload', schema);
