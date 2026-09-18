import { loadFixtures, importFixtures, exportFixtures, isFixture, setOptions } from '@bedrockio/fixtures';
import { createUpload } from './uploads.js';
import roles from '../roles.json' with { type: 'json' };

setOptions({
  roles,
  createUpload,
  warnCircularReferences: true,
});

export { isFixture, loadFixtures, importFixtures, exportFixtures };
