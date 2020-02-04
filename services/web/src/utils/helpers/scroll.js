export function scrollToTop() {
  if (window.scrollY === 0) {
    return Promise.resolve();
  } else {
    return new Promise(function(resolve) {

      function onScroll() {
        if (window.scrollY === 0) {
          window.removeEventListener('scroll', onScroll);
          resolve();
        }
      }

      // Some browsers will throw an error on scrollTo
      // when an options object is passed.
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        window.addEventListener('scroll', onScroll);
      } catch (err) {
        window.scrollTo(0, 0);
        resolve();
      }
    });
  }
}

