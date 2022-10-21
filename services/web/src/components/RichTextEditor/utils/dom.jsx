export function walkParents(node, fn) {
  fn(node);
  node = node.parentNode;
  while (node) {
    if (!fn(node, fn)) {
      break;
    }
    node = node.parentNode;
  }
}

export function walkSiblings(node, fn) {
  while (node) {
    if (!fn(node)) {
      return false;
    }
    if (!walkSiblings(node.firstChild, fn)) {
      return false;
    }
    node = node.nextSibling;
  }
  return true;
}

export function findParentElement(node) {
  while (node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode;
  }
  return node;
}
