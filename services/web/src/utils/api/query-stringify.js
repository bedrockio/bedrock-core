export default (obj) => {
  return obj
    ? Object.keys(obj)
        .map((key) => {
          const val = obj[key];
          if (Array.isArray(val)) {
            return val
              .map((val2) => {
                return `${encodeURIComponent(key)}=${encodeURIComponent(val2)}`;
              })
              .join('&');
          }

          return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        })
        .join('&')
    : '';
};
