// Overriding from draft-js
import getWindowForNode from 'draft-js/lib/getWindowForNode';

import getRangeBoundingClientRect from './getRangeBoundingClientRect';

/**
 * Return the bounding ClientRect for the visible DOM selection, if any.
 * In cases where there are no selected ranges or the bounding rect is
 * temporarily invalid, return null.
 *
 * When using from an iframe, you should pass the iframe window object
 */

function getVisibleSelectionRect(node) {
  var global = getWindowForNode(node);
  var selection = global.getSelection();

  if (!selection.rangeCount) {
    return null;
  }

  var range = selection.getRangeAt(0);
  var boundingRect = getRangeBoundingClientRect(range);
  var top = boundingRect.top,
    right = boundingRect.right,
    bottom = boundingRect.bottom,
    left = boundingRect.left; // When a re-render leads to a node being removed, the DOM selection will
  // temporarily be placed on an ancestor node, which leads to an invalid
  // bounding rect. Discard this state.

  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
    return null;
  }

  return boundingRect;
}

export default getVisibleSelectionRect;
