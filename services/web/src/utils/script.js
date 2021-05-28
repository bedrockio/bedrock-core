import { memoize } from 'lodash';

export const loadScript = memoize(function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.addEventListener('load', () => {
      resolve();
    });
    script.addEventListener('error', () => {
      reject(new Error(`Could not load URL ${src}`));
    });
    document.body.appendChild(script);
  });
});
