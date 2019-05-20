const less = require('less');
const fs = require('fs').promises;

const defaultOptions = {
  nameProjectionFunc: null
};

function lessToJSON(str = '', options) {
  options = Object.assign({}, defaultOptions, options);
  return new Promise((resolve, reject) => {
    less.parse(str, options.config, (err, root, imports, lessOpts) => {
      if (err) reject(err);

      let evalEnv = new less.contexts.Eval(lessOpts);
      let evaldRoot = root.eval(evalEnv);
      let ruleset = evaldRoot.rules;

      resolve(
        ruleset
          .filter((node) => node.variable === true)
          .reduce((prev, curr) => {
            let entry = {};
            entry[
              typeof options.nameProjectionFunc === 'function'
                ? options.nameProjectionFunc(curr.name)
                : curr.name
            ] = curr.value.toCSS(lessOpts);
            return Object.assign({}, prev, entry);
          }, {})
      );
    });
  });
}

(async () => {
  const lessString = await fs.readFile(
    './src/theme/site/globals/site.variables'
  );
  const json = await lessToJSON(lessString.toString());
  const data = {};
  Object.keys(json).forEach((key) => {
    data[key.replace('@', '')] = json[key].replace(/\\'/g, '"');
  });

  await fs.writeFile(
    'src/theme/theme.generated.json',
    JSON.stringify(data, null, 2)
  );

  // console.log(json);
})();
