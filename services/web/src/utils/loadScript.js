import { memoize } from 'lodash';

export default memoize(function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.addEventListener('load', () => {
      resolve();
    });
    script.addEventListener('error', reject);
    document.body.appendChild(script);
  });
});
