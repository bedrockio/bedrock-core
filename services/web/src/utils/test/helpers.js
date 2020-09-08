export function html(chunks, ...injected) {
  return chunks.reduce((str, chunk, i) => {
    chunk = chunk.replace(/(>)?\n\s+(\/>|<)?/g, (match, prev = '', next = '') => {
      const space = prev || next ? ''  : ' ';
      return prev + space + next;
    });
    chunk = chunk.replace(/&/g, '&amp;');
    if (i < injected.length) {
      chunk += injected[i];
    }
    return str + chunk;
  }, '').trim();
}
