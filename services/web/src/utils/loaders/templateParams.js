// Loader to allow variable interpolation in template
// partials included with "required". Example:
//
// <%= require('path/to/template.html') %>
//
// The template partial will be passed in parameters
// included in option.params to this loader:
//
// <script src="http://www.analytics.com?key=<%= ANALYTICS_KEY %>"></script>
//
// This loader is needed because interop between html-webpack-plugin
// and html-loader sucks.

const _ = require('lodash');
const { getOptions } = require('loader-utils');

module.exports = function(source) {
  const { params } = getOptions(this);
  const compiled = _.template(source);
  try {
    source = compiled(params);
  } catch(err) {
    this.emitError(err);
  }

  return `module.exports = ${JSON.stringify(source)}`;
};
