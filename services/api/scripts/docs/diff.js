#!/usr/bin/env node

import fs from 'fs';

const METHODS = ['get', 'put', 'post', 'patch', 'delete', 'head', 'options'];

// Hand-edited docs content, not API shape.
const IGNORED_KEYS = ['title', 'summary', 'description', 'examples', 'responses', 'x-generated'];

/**
 * Diffs two OpenAPI definition files and returns Markdown lines
 * describing added, removed, and changed operations and schemas.
 */
function diffSpecs(baseFile, headFile) {
  const base = readSpec(baseFile);
  const head = readSpec(headFile);

  const lines = [
    ...diffSection('Operations', getOperations(base), getOperations(head)),
    ...diffSection('Schemas', base.components?.schemas || {}, head.components?.schemas || {}),
  ];

  return lines.length ? lines : ['No changes.'];
}

function readSpec(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return {};
  }
}

function getOperations(spec) {
  const operations = {};
  for (let [path, item] of Object.entries(spec.paths || {})) {
    for (let method of METHODS) {
      const operation = item[method];
      if (operation) {
        const { parameters = [], ...rest } = operation;
        operations[`${method.toUpperCase()} ${path}`] = {
          ...rest,
          parameters: Object.fromEntries(
            parameters.map((param) => {
              return [`${param.in}:${param.name}`, param];
            }),
          ),
        };
      }
    }
  }
  return operations;
}

function diffSection(title, base, head) {
  const lines = [];
  for (let name of Object.keys(head)) {
    if (!base[name]) {
      lines.push(`- Added \`${name}\``);
    }
  }
  for (let name of Object.keys(base)) {
    if (!head[name]) {
      lines.push(`- Removed \`${name}\``);
    }
  }
  for (let name of Object.keys(head)) {
    if (base[name]) {
      const changes = diffObjects(base[name], head[name]);
      if (changes.length) {
        lines.push(`- Changed \`${name}\``, ...changes.map((change) => `  - ${change}`));
      }
    }
  }
  return lines.length ? [`## ${title}`, '', ...lines, ''] : [];
}

function diffObjects(base, head) {
  const baseFlat = flatten(base);
  const headFlat = flatten(head);
  const changes = [];

  for (let key of getRoots(headFlat, baseFlat)) {
    changes.push(`Added \`${formatKey(key)}\``);
  }
  for (let key of getRoots(baseFlat, headFlat)) {
    changes.push(`Removed \`${formatKey(key)}\``);
  }
  for (let [key, value] of headFlat) {
    if (baseFlat.has(key) && baseFlat.get(key) !== value) {
      changes.push(`\`${formatKey(key)}\`: \`${baseFlat.get(key)}\` → \`${value}\``);
    }
  }
  return changes;
}

// Leaf values keyed by path. Arrays of primitives (required, enum) are compared whole.
function flatten(obj, prefix = [], result = new Map()) {
  if (isPrimitiveArray(obj) || obj === null || typeof obj !== 'object') {
    result.set(prefix.join('.'), JSON.stringify(obj));
    return result;
  }
  for (let [key, value] of Object.entries(obj)) {
    if (!IGNORED_KEYS.includes(key) && value !== undefined) {
      flatten(value, [...prefix, key], result);
    }
  }
  return result;
}

function isPrimitiveArray(obj) {
  return Array.isArray(obj) && obj.every((el) => el === null || typeof el !== 'object');
}

// Collapses keys missing from "other" to the shortest missing prefix, so
// an added object is reported once instead of once per leaf.
function getRoots(flat, other) {
  const otherPrefixes = new Set();
  for (let key of other.keys()) {
    const parts = key.split('.');
    for (let i = 1; i <= parts.length; i++) {
      otherPrefixes.add(parts.slice(0, i).join('.'));
    }
  }
  const roots = new Set();
  for (let key of flat.keys()) {
    if (!other.has(key)) {
      const parts = key.split('.');
      let i = 1;
      while (i < parts.length && otherPrefixes.has(parts.slice(0, i).join('.'))) {
        i++;
      }
      roots.add(parts.slice(0, i).join('.'));
    }
  }
  return roots;
}

function formatKey(key) {
  return key
    .replace(/^requestBody\.content\.[^.]+\/[^.]+\.schema\.?/, 'body.')
    .replace(/(^|\.)properties\./g, '$1')
    .replace(/\.$/, '');
}

if (import.meta.main) {
  const [baseFile, headFile] = process.argv.slice(2);
  process.stdout.write(diffSpecs(baseFile, headFile).join('\n') + '\n');
}

export { diffSpecs };
