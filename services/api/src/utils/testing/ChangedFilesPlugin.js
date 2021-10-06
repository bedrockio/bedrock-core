// In --watch mode Jest runs with --onlyChanged, attempting to
// only run files that have changed. However this only works with
// static dependencies, otherwise it will bail and run all tests on
// any change.
//
// This watch plugin is like a poor man's --onlyChanged option,
// re-running only changed (non-committed or staged) tests or files
// naively without the dependency tree. This assumes using the __tests__
// convention. For example the following tests will run when their
// associated library has changes:
//
// routes/users.js -> routes/__tests__/users.js
// routes/users.js -> routes/__tests__/users.test.js
//
// Note: using the --watch-all flag will disable this plugin
// entirely and run all tests as usual.
//
// Note: there seems to be a transitent bug when running a previously
// skipped test immediately again (within a few seconds) will skip
// again even if the file becomes change. It seems like it could be
// an issue with watchman, however it only happens when saving files
// very quickly again.

const path = require('path');
const { getChangedFilesForRoots } = require('jest-changed-files');
const { globsToMatcher } = require('jest-util');
const { memoize } = require('lodash');

// Thank so much jest for not exposing this CLI config.
const isWatchAll = process.argv.some((arg) => {
  return arg === '--watch-all';
});

class ChangedFilesPlugin {
  apply(jestHooks) {
    if (!isWatchAll) {
      jestHooks.shouldRunTestSuite(async ({ config, testPath }) => {
        const matcher = getMatcher(config);
        const changedFiles = await this.getChangedFiles();
        if (!matcher(testPath)) {
          return false;
        }
        const associated = this.getAssociated(testPath);
        return changedFiles.some((file) => {
          if (file === testPath) {
            // If the test file itself has changed, then always run.
            return true;
          } else {
            // Otherwise check if it matches the test's expected lib,
            // for example __tests__/users.js -> users.js
            return file === associated;
          }
        });
      });
    }
  }

  async getChangedFiles() {
    const { changedFiles } = await getChangedFilesForRoots(['.']);
    return Array.from(changedFiles);
  }

  getAssociated(testPath) {
    let basename = path.basename(testPath, '.js');
    basename = path.basename(basename, '.test');
    return path.resolve(testPath, `../../${basename}.js`);
  }
}

const getMatcher = memoize(
  (config) => {
    return globsToMatcher(config.testMatch);
  },
  (config) => {
    // Just in case allow monorepo usage by only caching per root
    return config.rootDir;
  }
);

module.exports = ChangedFilesPlugin;
