const mongoose = require('mongoose');
const { camelCase, kebabCase, upperFirst } = require('lodash');

function pluralCamel(str) {
  // Mongoose pluralize is for db collections so will lose camel casing,
  // ie UserProfile -> userprofiles. To achieve the target "userProfiles",
  // first convert to kebab, then pluralize, then back to camel.
  return camelCase(mongoose.pluralize()(kebabCase(str)));
}

function pluralUpper(str) {
  return upperFirst(pluralCamel(str));
}

function camelUpper(str) {
  return upperFirst(camelCase(str));
}

function pluralKebab(str) {
  return mongoose.pluralize()(kebabCase(str));
}

module.exports = {
  pluralCamel,
  pluralUpper,
  pluralKebab,
  camelUpper,
  kebabCase,
};
