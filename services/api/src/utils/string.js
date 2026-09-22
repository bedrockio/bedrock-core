// Template literal tag that de-indents lines
// to the smallest indentation.
function dedent(strings, ...vars) {
  const str = strings
    .map((sub, i) => {
      return sub + (vars[i] || '');
    })
    .join('');
  const lines = str.split('\n');
  let indent = Infinity;
  for (let line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.length !== 0) {
      indent = Math.min(indent, line.length - trimmed.length);
    }
  }
  return lines
    .map((line) => {
      return line.slice(indent);
    })
    .join('\n')
    .trim();
}

export { dedent };
