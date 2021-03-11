export function getDocumentLocationQuery(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return undefined;
  if (!results[2]) return undefined;
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
