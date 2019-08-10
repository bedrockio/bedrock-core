const fs = require('fs').promises;
const path = require('path');
const juice = require('juice'); //eslint-disable-line

const templateFolder = path.join(__dirname, './src');
const distFolder = path.join(__dirname, './dist');

function juiceResources(content, options) {
  return new Promise((resolve, reject) => {
    juice.juiceResources(content, options, (err, html) => {
      if (err) return reject(err);
      return resolve(html);
    });
  });
}

async function handleFolder(folderPath, folderName) {
  const files = await fs.readdir(folderPath);
  const htmlFiles = files.filter((c) => c.includes('.html'));

  await fs.mkdir(path.join(distFolder, folderName), { recursive: true });

  for (const htmlFile of htmlFiles) {
    const fileContent = await fs.readFile(path.join(folderPath, htmlFile));
    const inlined = await juiceResources(fileContent.toString(), {
      webResources: { images: true, svgs: true, scripts: false, relativeTo: folderPath }
    });
    await fs.writeFile(path.join(distFolder, folderName, htmlFile), inlined);
  }
}

(async () => {
  for (const folder of await fs.readdir(templateFolder)) {
    await handleFolder(path.join(templateFolder, folder), folder);
  }
  console.log('done');
})();
