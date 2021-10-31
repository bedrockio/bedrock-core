import path from 'path';
import _ from 'lodash';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import cheerio from 'cheerio';
import config from '@bedrockio/config';

async function buildTemplate({ template = 'index.html' }) {
  const dir = path.dirname(template);
  const file = path.resolve(process.cwd(), template);
  const source = loadTemplateSource(file);
  return {
    dir,
    source,
  };
}

function loadTemplateSource(file) {
  const dir = path.dirname(file);
  const source = readFileSync(file, 'utf8');
  return _.template(source)({
    ...config.getAll(),
    require: (p) => {
      return loadTemplateSource(path.resolve(dir, p));
    },
  });
}

function mapOutputs(outputs) {
  const result = {};
  for (let [key, meta] of Object.entries(outputs)) {
    if (meta.entryPoint) {
      result[meta.entryPoint] = key;
    } else if (key.match(/\.css$/)) {
      // TODO: figure out how to map this in a less brittle way
      result['src/index.css'] = key;
    }
  }
  return result;
}

export default function (options) {
  return {
    name: 'html',
    setup(build) {
      build.initialOptions.metafile = true;
      build.onEnd(async ({ metafile }) => {
        let { dir, source } = await buildTemplate(options);
        const $ = cheerio.load(source);
        const outputs = mapOutputs(metafile.outputs);
        const { outdir } = build.initialOptions;
        for (let { attribs } of $('script')) {
          if (attribs.src) {
            const target = outputs[path.join(dir, attribs.src)];
            if (target) {
              attribs.src = `/${path.relative(outdir, target)}`;
            }
          }
        }
        for (let { attribs } of $('link')) {
          if (attribs.href) {
            const target = outputs[path.join(dir, attribs.href)];
            if (target) {
              attribs.href = `/${path.relative(outdir, target)}`;
            }
          }
        }
        const { outfile = path.basename(options.template) } = options;
        await writeFile(path.join(outdir, outfile), $.html());
      });
    },
  };
}
