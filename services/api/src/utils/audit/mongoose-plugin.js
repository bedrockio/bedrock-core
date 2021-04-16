const mongoose = require('mongoose');

const omit = require('omit-deep');
const pick = require('lodash.pick');
const empty = require('deep-empty-object');
const { assign } = require('power-assign');

// try to find an id property, otherwise just use the index in the array
const objectHash = (obj, idx) => obj._id || obj.id || `$$index: ${idx}`;
const diffPatcher = require('jsondiffpatch').create({ objectHash });

const History = require('./diffHistoryModel').model;

//https://eslint.org/docs/rules/complexity#when-not-to-use-it
/* eslint-disable complexity */
function checkRequired(opts, queryObject, updatedObject) {
  if (queryObject && !queryObject.options && !updatedObject) {
    return;
  }
  const { __user: user, __reason: reason } = (queryObject && queryObject.options) || updatedObject;
  if (opts.required && ((opts.required.includes('user') && !user) || (opts.required.includes('reason') && !reason))) {
    return true;
  }
}

function saveDiffObject(currentObject, original, updated, opts, queryObject) {
  const { __user: user, __reason: reason, __session: session } = (queryObject && queryObject.options) || currentObject;

  let diff = diffPatcher.diff(JSON.parse(JSON.stringify(original)), JSON.parse(JSON.stringify(updated)));

  if (opts.omit) {
    omit(diff, opts.omit, { cleanEmpty: true });
  }

  if (opts.pick) {
    diff = pick(diff, opts.pick);
  }

  if (!diff || !Object.keys(diff).length || empty.all(diff)) {
    return;
  }

  const collectionId = currentObject._id;
  const collectionName = currentObject.constructor.modelName || queryObject.model.modelName;

  return History.findOne({ collectionId, collectionName })
    .sort('-version')
    .then((lastHistory) => {
      const history = new History({
        collectionId,
        collectionName,
        diff,
        user,
        reason,
        version: lastHistory ? lastHistory.version + 1 : 0,
      });
      if (session) {
        return history.save({ session });
      }
      return history.save();
    });
}

/* eslint-disable complexity */

const saveDiffHistory = (queryObject, currentObject, opts) => {
  const queryUpdate = queryObject.getUpdate();
  const schemaOptions = queryObject.model.schema.options || {};

  let keysToBeModified = [];
  let mongoUpdateOperations = [];
  let plainKeys = [];

  for (const key in queryUpdate) {
    const value = queryUpdate[key];
    if (key.startsWith('$') && typeof value === 'object') {
      const innerKeys = Object.keys(value);
      keysToBeModified = keysToBeModified.concat(innerKeys);
      if (key !== '$setOnInsert') {
        mongoUpdateOperations = mongoUpdateOperations.concat(key);
      }
    } else {
      keysToBeModified = keysToBeModified.concat(key);
      plainKeys = plainKeys.concat(key);
    }
  }

  const dbObject = pick(currentObject, keysToBeModified);
  let updatedObject = assign(dbObject, pick(queryUpdate, mongoUpdateOperations), pick(queryUpdate, plainKeys));

  let { strict } = queryObject.options || {};
  // strict in Query options can override schema option
  strict = strict !== undefined ? strict : schemaOptions.strict;

  if (strict === true) {
    const validPaths = Object.keys(queryObject.model.schema.paths);
    updatedObject = pick(updatedObject, validPaths);
  }

  return saveDiffObject(currentObject, dbObject, updatedObject, opts, queryObject);
};

const saveDiffs = (queryObject, opts) =>
  queryObject
    .find(queryObject._conditions)
    .cursor()
    .eachAsync((result) => saveDiffHistory(queryObject, result, opts));

const getDiffs = (modelName, id, opts) => {
  opts = opts || {};
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  return History.find({ collectionName: modelName, collectionId: id }, null, opts).lean();
};

/**
 * @param {Object} schema - Schema object passed by Mongoose Schema.plugin
 * @param {Object} [opts] - Options passed by Mongoose Schema.plugin
 * @param {string} [opts.uri] - URI for MongoDB (necessary, for instance, when not using mongoose.connect).
 * @param {string|string[]} [opts.omit] - fields to omit from diffs (ex. ['a', 'b.c.d']).
 */
const plugin = function lastModifiedPlugin(schema, opts = {}) {
  if (opts.omit && !Array.isArray(opts.omit)) {
    if (typeof opts.omit === 'string') {
      opts.omit = [opts.omit];
    } else {
      const errMsg = `opts.omit expects string or array, instead got '${typeof opts.omit}'`;
      throw new TypeError(errMsg);
    }
  }

  schema.pre('save', function (next) {
    if (this.isNew) return next();
    this.constructor
      .findOne({ _id: this._id })
      .then((original) => {
        if (checkRequired(opts, {}, this)) {
          return;
        }
        return saveDiffObject(this, original, this.toObject({ depopulate: true }), opts);
      })
      .then(() => next())
      .catch(next);
  });

  schema.pre('findOneAndUpdate', function (next) {
    if (checkRequired(opts, this)) {
      return next();
    }
    saveDiffs(this, opts)
      .then(() => next())
      .catch(next);
  });

  schema.pre('update', function (next) {
    if (checkRequired(opts, this)) {
      return next();
    }
    saveDiffs(this, opts)
      .then(() => next())
      .catch(next);
  });

  schema.pre('updateOne', function (next) {
    if (checkRequired(opts, this)) {
      return next();
    }
    saveDiffs(this, opts)
      .then(() => next())
      .catch(next);
  });

  schema.pre('remove', function (next) {
    if (checkRequired(opts, this)) {
      return next();
    }
    saveDiffObject(this, this, {}, opts)
      .then(() => next())
      .catch(next);
  });
};

module.exports = {
  plugin,
  getVersion,
  getDiffs,
  getHistories,
};
