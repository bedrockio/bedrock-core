import PropTypes from 'prop-types';
import { Button } from 'semantic';

import { useClass } from 'helpers/bem';

import {
  undo,
  redo,
  canUndo,
  canRedo,
  setAlignment,
  toggleBlockType,
  toggleInlineStyle,
  getCurrentBlockType,
  canToggleInlineStyle,
  hasCurrentInlineStyle,
} from './utils';

import { BUTTON_STYLES } from './const';
import { useRichTextEditor } from './context';

import './button.less';

export default function RichTextEditorButton(props) {
  const { type, toggled, disabled, ...rest } = props;

  const { editorState, showMarkdown, toggleMarkdown, updateEditorState } =
    useRichTextEditor();

  const { className } = useClass(
    'rich-text-editor-button',
    isToggled() ? 'toggled' : null
  );

  function isToggled() {
    const { block, style } = BUTTON_STYLES[type];
    if (type === 'markdown') {
      return showMarkdown;
    } else if (block) {
      return getCurrentBlockType(editorState) === block;
    } else {
      return hasCurrentInlineStyle(editorState, style);
    }
  }

  function isDisabled() {
    const { style } = BUTTON_STYLES[type];
    if (type === 'undo') {
      return !canUndo(editorState);
    } else if (type === 'redo') {
      return !canRedo(editorState);
    } else if (style) {
      return !canToggleInlineStyle(editorState, style);
    } else {
      return disabled;
    }
  }

  function onClick() {
    const { style, block, alignment } = BUTTON_STYLES[type];
    if (type === 'markdown') {
      toggleMarkdown();
    } else if (type === 'undo') {
      updateEditorState(undo(editorState));
    } else if (type === 'redo') {
      updateEditorState(redo(editorState));
    } else if (style) {
      updateEditorState(toggleInlineStyle(editorState, style));
    } else if (block) {
      updateEditorState(toggleBlockType(editorState, block));
    } else if (alignment) {
      updateEditorState(setAlignment(editorState, alignment));
    }
  }

  function render() {
    const { icon, title, label } = BUTTON_STYLES[type];
    return (
      <Button
        {...rest}
        icon={icon}
        type="button"
        title={title}
        content={label}
        onClick={props.onClick || onClick}
        className={className}
        disabled={isDisabled()}
      />
    );
  }

  return render();
}

RichTextEditorButton.propTypes = {
  type: PropTypes.oneOf(Object.keys(BUTTON_STYLES)).isRequired,
  toggled: PropTypes.bool,
  disabled: PropTypes.bool,
};

RichTextEditorButton.defaultProps = {
  toggled: false,
  disabled: false,
};
