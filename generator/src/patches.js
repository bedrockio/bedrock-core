const { yellow } = require('kleur');
const { assertPath, block, indent } = require('./util');
const { readLocalFile, writeLocalFile } = require('./source');

// App Entrypoint

const APP_ENTRYPOINT_PATH = 'services/web/src/App.js';

const ROUTE_REG = /^(\s*)(<(AuthSwitch|Protected|Route)[\s\S]+?\/>)/m;
const IMPORTS_REG = /(import {)(\s+)([^}]+?} from ['"]screens)/m;

async function patchAppEntrypoint(options) {
  const { pluralLower, pluralUpper } = options;

  const entrypointPath = await assertPath(APP_ENTRYPOINT_PATH);
  let source = await readLocalFile(entrypointPath);
  const jsx = `<Protected path="/${pluralLower}/:id?" allowed={${pluralUpper}} />\n`;
  if (!source.includes(jsx)) {
    source = source.replace(ROUTE_REG, (match, space, rest) => {
      return space + jsx + space + rest;
    });
    source = source.replace(IMPORTS_REG, (match, prefix, space, rest) => {
      return `${prefix}${space}${pluralUpper},${space}${rest}`;
    });
  }
  await writeLocalFile(source, entrypointPath);
}


// Index Entrypoints

async function patchIndex(dir, name, ext = '') {
  ext = ext ? `.${ext}` : '';
  const line = `export { default as ${name} } from './${name}${ext}';`;
  let source = await readLocalFile(dir, 'index.js');
  if (!source.includes(line)) {
    if (source.slice(-1) !== '\n') {
      source += '\n';
    }
    source += line;
  }
  await writeLocalFile(source, dir, 'index.js');
}


// Main Menu

const HEADER_PATH = 'services/web/src/components/Header.js';
const MENU_ITEM_REG = /<Menu\.Item[\s\S]+?<\/Menu\.Item>/gm;

async function patchMainMenu(options) {
  const { pluralLower, pluralUpper } = options;

  const headerPath = await assertPath(HEADER_PATH);
  let source = await readLocalFile(headerPath);

  const match = source.match(MENU_ITEM_REG);
  if (match) {
    const last = match[match.length - 1];
    const index = source.indexOf(last) + last.length;
    const before = source.slice(0, index);
    const after = source.slice(index);
    const tabs = after.match(/\n(\s+)/)[1];
    const menuItem = block`
      <Menu.Item as={NavLink} to="/${pluralLower}">
        ${pluralUpper}
      </Menu.Item>
    `;

    if (!match.join('').includes(pluralUpper)) {
      source = '';
      source += before;
      source += '\n';
      source += indent(menuItem, tabs.length);
      source += after;
      await writeLocalFile(source, headerPath);
    }
  }

  console.log(yellow('Main menu link generated!'));
}

module.exports = {
  patchIndex,
  patchMainMenu,
  patchAppEntrypoint,
};
