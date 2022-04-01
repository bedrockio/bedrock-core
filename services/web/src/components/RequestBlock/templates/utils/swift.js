/**
  The MIT License (MIT)
  Copyright (c) 2015 Mashape (https://www.mashape.com)
*/

function buildString(length, str) {
  return Array.apply(null, new Array(length))
    .map(String.prototype.valueOf, str)
    .join('');
}

function concatArray(arr, pretty, indentation, indentLevel) {
  const currentIndent = buildString(indentLevel, indentation);
  const closingBraceIndent = buildString(indentLevel - 1, indentation);
  const join = pretty ? ',\n' + currentIndent : ', ';

  if (pretty) {
    return (
      '[\n' + currentIndent + arr.join(join) + '\n' + closingBraceIndent + ']'
    );
  } else {
    return '[' + arr.join(join) + ']';
  }
}

export function literalDeclaration(name, parameters, opts) {
  return `let ${name} = ${literalRepresentation(parameters, opts)}`;
}

export function literalRepresentation(value, opts, indentLevel) {
  indentLevel = indentLevel === undefined ? 1 : indentLevel + 1;

  switch (Object.prototype.toString.call(value)) {
    case '[object Number]':
      return value;

    case '[object Array]': {
      // Don't prettify arrays nto not take too much space
      let pretty = false;
      const valuesRepresentation = value.map(
        function (v) {
          // Switch to prettify if the value is a dictionary with multiple keys
          if (Object.prototype.toString.call(v) === '[object Object]') {
            pretty = Object.keys(v).length > 1;
          }
          return literalRepresentation(v, opts, indentLevel);
        }.bind(this)
      );
      return concatArray(
        valuesRepresentation,
        pretty,
        opts.indent,
        indentLevel
      );
    }

    case '[object Object]': {
      const keyValuePairs = [];
      for (const k in value) {
        keyValuePairs.push(
          `"${k}": ${literalRepresentation(value[k], opts, indentLevel)}`
        );
      }
      return concatArray(
        keyValuePairs,
        opts.pretty && keyValuePairs.length > 1,
        opts.indent,
        indentLevel
      );
    }

    case '[object Boolean]':
      return value.toString();

    default:
      if (value === null || value === undefined) {
        return '';
      }
      return '"' + value.toString().replace(/"/g, '\\"') + '"';
  }
}
