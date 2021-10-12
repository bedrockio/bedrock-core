async function stringReplaceAsync(str, reg, fn) {
  const promises = [];
  str.replace(reg, (...args) => {
    promises.push(fn(...args));
  });
  const resolved = await Promise.all(promises);
  str = str.replace(reg, () => {
    return resolved.shift();
  });
  return str;
}

module.exports = {
  stringReplaceAsync,
};
