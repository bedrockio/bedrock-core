import { once } from 'lodash';
import { walkParents, walkSiblings, findParentElement } from './dom';

// Gets only the rects of inline elements. This allows a text
// range bounding box to not fill out to with of parent block
// level elements.

function getRangeInlineRects(range) {
  const rects = [];
  const { startContainer, endContainer } = range;
  traverseRange(range, (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const style = window.getComputedStyle(node);
      if (style.display.startsWith('inline')) {
        let rect = node.getBoundingClientRect();
        if (node.contains(startContainer)) {
          const text = node.textContent.slice(0, range.startOffset);
          rect = applyRectOffset(rect, text, style, 1);
        }
        if (node.contains(endContainer)) {
          const text = node.textContent.slice(range.endOffset);
          rect = applyRectOffset(rect, text, style, 0);
        }
        rects.push(rect);
      }
    }
  });
  if (rects.length) {
    return rects;
  } else {
    // If getting inline rects didn't work then bail and
    // just send back the bounding rect of the common ancestor.
    const parentElement = findParentElement(range.commonAncestorContainer);
    return [parentElement.getBoundingClientRect()];
  }
}

function applyRectOffset(rect, text, style, start) {
  if (text) {
    const width = getTextWidth(text, style);
    rect = new DOMRect(
      rect.left + width * start,
      rect.top,
      rect.width - width,
      rect.height
    );
  }
  return rect;
}

function getTextWidth(text, style) {
  const ctx = getCanvasContext();
  ctx.font = style.font;
  ctx.fillText(text, 100, 100);
  return ctx.measureText(text).width;
}

function traverseRange(range, fn) {
  const { startContainer, endContainer } = range;
  if (startContainer === endContainer) {
    fn(findParentElement(range.commonAncestorContainer));
    return;
  }
  let startParent;
  walkParents(startContainer, (node) => {
    startParent = node;
    return node.parentNode !== range.commonAncestorContainer;
  });
  walkSiblings(startParent, (node) => {
    fn(node);
    return node !== endContainer;
  });
}

const getCanvasContext = once(() => {
  const canvas = document.createElement('canvas');
  return canvas.getContext('2d');
});

export default getRangeInlineRects;
