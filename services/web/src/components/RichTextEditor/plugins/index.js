import { composeDecorators } from '@draft-js-plugins/editor';
import createLinkPlugin from '@draft-js-plugins/anchor';
import createFocusPlugin from '@draft-js-plugins/focus';
import createImagePlugin from '@draft-js-plugins/image';
import createBlockDndPlugin from '@draft-js-plugins/drag-n-drop';
import createAlignmentPlugin from '@draft-js-plugins/alignment';
import createResizeablePlugin from '@draft-js-plugins/resizeable';

import createTextAlignmentPlugin from './textAlignmentPlugin';
import createFloatPlugin from './floatPlugin';
import createTablePlugin from './tablePlugin';
import createPastePlugin from './pastePlugin';

import './plugins.less';

const linkPlugin = createLinkPlugin();
const focusPlugin = createFocusPlugin({
  theme: {
    focused: 'rich-text__focus-target--focused',
    unfocused: 'rich-text__focus-target--unfocused',
  },
});
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const textAlignmentPlugin = createTextAlignmentPlugin();
const floatPlugin = createFloatPlugin();
const tablePlugin = createTablePlugin();
const pastePlugin = createPastePlugin();
const resizeablePlugin = createResizeablePlugin({
  initialWidth: '100%',
});

export const { AlignmentTool } = alignmentPlugin;

// Note the order of these decorators matters.
export const imagePlugin = createImagePlugin({
  decorator: composeDecorators(
    resizeablePlugin.decorator,
    alignmentPlugin.decorator,
    focusPlugin.decorator,
    blockDndPlugin.decorator
  ),
});

export default [
  linkPlugin,
  focusPlugin,
  imagePlugin,
  blockDndPlugin,
  alignmentPlugin,
  resizeablePlugin,
  textAlignmentPlugin,
  floatPlugin,
  tablePlugin,
  pastePlugin,
];
