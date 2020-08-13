const path = require('path');
const mkdirp = require('mkdirp');
const prompt = require('./prompt');
const fs = require('fs').promises;

function block(chunks, ...values) {
  let lines = chunks.map((chunk, i) => {
    return chunk + (values[i] || '');
  })
    .join('')
    .split('\n')
    .filter((line) => {
      return line.trim().length > 0;
    });
  const indent = lines.reduce((indent, line) => {
    return Math.min(indent, line.match(/\s*/)[0].length);
  }, Infinity);
  lines = lines.map((line) => {
    return line.slice(indent);
  });
  return lines.join('\n').trim();
}

function indent(str, tabs) {
  if (typeof tabs === 'number') {
    tabs = ' '.repeat(tabs);
  }
  return str
    .split('\n')
    .map((line) => {
      return tabs + line;
    })
    .join('\n');
}

function mkdir(...args) {
  return mkdirp(path.resolve(...args));
}

// Path resolution with caching. If a directory doesn't
// exist will prompt the user for the updated directory
// and cache the result to be used later.

const cache = new Map();

async function assertPath(...args) {
  let relDir = getRelativePath(...args);
  if (cache.has(relDir)) {
    return cache.get(relDir);
  }
  try {
    await fs.stat(relDir);
    return relDir;
  } catch(err) {
    const newDir = await prompt({
      type: 'text',
      name: 'path',
      message: `${path.basename(relDir)} dir`,
      initial: relDir,
    });
    await mkdir(newDir);
    cache.set(relDir, newDir);
    return newDir;
  }
}

function getRelativePath(...args) {
  return path.relative(process.cwd(), path.resolve(__dirname, '../..', ...args));
}

module.exports = {
  mkdir,
  block,
  indent,
  assertPath,
};

