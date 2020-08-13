
function getCamelLower(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function getPlural(str) {
  str = str.replace(/y$/, 'ie');
  str = str.replace(/fe?$/, 've');
  str = str.replace(/([trd])o$/, '$1oe');
  str += 's';
  return str;
}

module.exports = {
  getPlural,
  getCamelLower,
};
