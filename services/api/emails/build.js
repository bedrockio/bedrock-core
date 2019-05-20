const fs = require('fs');
const path = require('path');
const juice = require('juice'); //eslint-disable-line

const templateFolder = path.join(__dirname, './src');
const distFolder = path.join(__dirname, './dist');

fs.readFile(path.join(__dirname, './src/style.css'), (styleErr, style) => {
  if (styleErr) throw styleErr;
  fs.readdir(templateFolder, (readDirErr, files) => {
    if (readDirErr) throw readDirErr;
    files.forEach((file) => {
      if (file === 'style.css') return;
      fs.readFile(path.join(templateFolder, file), (readFileErr, template) => {
        if (readFileErr) throw readFileErr;
        const inlined = juice.inlineContent(template.toString(), style.toString());
        fs.writeFile(path.join(distFolder, file), inlined, (err) => {
          if (err) throw err;
        });
      });
    });
  });
});
