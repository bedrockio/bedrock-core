const process = require('process');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const ignoreFiles = ['.gitignore', 'bedrock.json', 'README.md'];

function injectByReg(source, replace, reg) {
  if (!source.includes(replace)) {
    const match = source.match(reg);
    if (match) {
      const last = match[match.length - 1];
      const index = source.indexOf(last) + last.length;

      let src = '';
      src += source.slice(0, index);
      src += '\n';
      src += replace;
      src += source.slice(index);
      source = src;
    }
  }
  return source;
}

function injectAtEnd(source, replace) {
  if (!source.includes(replace)) {
    source += `${replace}`;
  }
  return source;
}

async function installPackageJsonDependencies(
  destination,
  packageFile,
  dependencies
) {
  const packageInfo = JSON.parse(
    fs.readFileSync(path.join(destination, packageFile)).toString('utf-8')
  );
  Object.keys(dependencies).forEach((package) => {
    const version = dependencies[package];
    console.info(
      `Configuring Node.js dependency in ${packageFile}: ${package}:${version}`
    );
    packageInfo.dependencies[package] = version;
  });
  fs.writeFileSync(
    path.join(destination, packageFile),
    JSON.stringify(packageInfo, null, 2)
  );
}

async function installServiceEnv(destination, file, env, info) {
  let code = fs.readFileSync(path.join(destination, file)).toString('utf-8');
  code = injectAtEnd(code, `\n# ${info.name}\n`);
  Object.keys(env).forEach((key) => {
    const value = env[key];
    console.info(`Configuring env default in ${file}: ${key}`);
    code = injectAtEnd(code, `${key}=${value}\n`);
  });
  fs.writeFileSync(path.join(destination, file), code);
}

async function installApiRoutes(destination, file, routes) {
  let code = fs.readFileSync(path.join(destination, file)).toString('utf-8');
  for (const route of routes) {
    const absolutePath = path.resolve(path.join(destination, route.path));
    const absoluteDirPath = path.dirname(
      path.resolve(path.join(destination, file))
    );
    const routeIncludePath = path.basename(
      absolutePath.slice(absoluteDirPath.length + 1),
      '.js'
    );
    const name = route.name;
    console.info(`Including route in ${file}: /1/${name}`);
    const includeCode = `\nconst ${name} = require('./${routeIncludePath}');\nrouter.use('/${name}', ${name}.routes());`;
    code = injectByReg(code, includeCode, /^router.use\(.+\);$/gm);
  }
  fs.writeFileSync(path.join(destination, file), code);
}

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
};

async function getInfo(source) {
  return JSON.parse(fs.readFileSync(source + '/bedrock.json'));
}

async function copyFiles(source, destination) {
  const absoluteSourcePath = path.resolve(source);
  const files = getAllFiles(absoluteSourcePath);
  console.info('Copying files:');
  for (const file of files) {
    const relativePath = file.slice(absoluteSourcePath.length);
    const fileName = file.split('/').slice(-1)[0];
    if (ignoreFiles.includes(fileName)) {
      continue;
    }
    console.info(` ${relativePath}`);
    const destinationPath = destination + relativePath;
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(file, destinationPath);
  }
}

async function summarizePlugin(source) {
  const info = await getInfo(source);
  console.info(`Plugin: ${info.name}`);
  if (info.description) {
    console.info(`  ${info.description}`);
  }
  const { api } = info.services;
  if (api) {
    const { dependencies, routes, env } = api;
    if (dependencies) {
      console.info(`API Node Dependencies:`);
      Object.keys(dependencies).forEach((package) => {
        const version = dependencies[package];
        console.info(`  ${package}: ${version}`);
      });
    }
    if (routes) {
      console.info(`API Routes:`);
      routes.forEach((route) => {
        console.info(`  ${route.path}`);
      });
    }
  }

  console.info(`Files:`);
  const absoluteSourcePath = path.resolve(source);
  const files = getAllFiles(absoluteSourcePath);
  for (const file of files) {
    const relativePath = file.slice(absoluteSourcePath.length);
    const fileName = file.split('/').slice(-1)[0];
    if (ignoreFiles.includes(fileName)) {
      continue;
    }
    console.info(` ${relativePath}`);
  }
}

async function installDependencies(source, destination) {
  const info = await getInfo(source);
  const { api } = info.services;
  if (api) {
    const { dependencies, env, routes } = api;
    if (dependencies) {
      await installPackageJsonDependencies(
        destination,
        '/services/api/package.json',
        dependencies
      );
    }
    if (env) {
      await installServiceEnv(destination, '/services/api/env.conf', env, info);
    }
    if (routes) {
      await installApiRoutes(
        destination,
        '/services/api/src/v1/index.js',
        routes
      );
    }
  }
}

async function installPluginCli() {
  const source = process.argv[2];
  if (!source) {
    throw new Error(`Usage: ${process.argv[1]} <folder-or-github-repo>`);
  }
  await summarizePlugin(source);
  const continuePrompt = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Proceed in installing this plugin?',
    active: 'Yes',
    inactive: 'No',
    initial: true,
  });
  if (continuePrompt.value === true) {
    const destination = __dirname + '/../..';
    await copyFiles(source, destination);
    await installDependencies(source, destination);
  }
}

module.exports = {
  installPluginCli,
};
