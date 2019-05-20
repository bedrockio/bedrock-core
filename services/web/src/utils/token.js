export const getToken = (props) => {
  const { location } = props;
  const { search } = location;
  if (!search || !search.length) return null;
  const md = search.match(/token=([^&]+)$/);
  if (!md || !md[1]) return null;
  return md[1];
};

export const parseToken = (token) => {
  const base64Url = (token || '').split('.');
  if (!base64Url[1]) return null;
  const base64 = base64Url[1].replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};
