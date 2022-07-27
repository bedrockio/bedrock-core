const MATH_TOKEN_REG = /\\([$;,])/g;

export function escapeMathTokens(str) {
  // Double escape backslashes in cases that will
  // affect math expressions as markdown parsing
  // will remove them. For example, a literal
  // dollar sign is represented with \$1000 while
  // \; and \, each have special meaning inside
  // math expressions. These will need to be
  // unescaped when converting back.
  return str.replace(MATH_TOKEN_REG, '\\\\$1');
}

export function unescapeMathTokens(str) {
  // Restore double escaped literal dollar signs.
  return str.replace(/\\{2}([$;,])/g, '\\$1');
}
