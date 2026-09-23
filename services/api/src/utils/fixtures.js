import { loadFixtures, importFixtures, exportFixtures, isFixture, setOptions } from '@bedrockio/fixtures';
import { createUpload } from './uploads.js';
import roles from '../roles.json' with { type: 'json' };

setOptions({
  roles,
  // Fixtures name the uploading user "owner".
  createUpload: (file, { owner, ...attributes }) => {
    return createUpload(file, { ...attributes, user: owner });
  },
  warnCircularReferences: true,
});

export { isFixture, loadFixtures, importFixtures, exportFixtures };
