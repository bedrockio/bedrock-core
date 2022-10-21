import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '/semantic';

import bem from '/helpers/bem';

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

import './button.less';

class RichTextEditorButton extends React.Component {
  getModifiers() {
    return [this.isToggled() ? 'toggled' : null];
  }

  isToggled() {
    const { editorState } = this.context;
    const { type } = this.props;
    const { block, style } = BUTTON_STYLES[type];
    if (type === 'markdown') {
      return this.context.showMarkdown;
    } else if (block) {
      return getCurrentBlockType(editorState) === block;
    } else {
      return hasCurrentInlineStyle(editorState, style);
    }
  }

  isDisabled() {
    const { type, disabled } = this.props;
    const { style } = BUTTON_STYLES[type];
    const { editorState } = this.context;
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

  onClick = () => {
    const { type } = this.props;
    const { style, block, alignment } = BUTTON_STYLES[type];
    const { editorState, updateEditorState } = this.context;
    if (type === 'markdown') {
      this.context.toggleMarkdown();
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
  };

  render() {
    const { type, toggled, disabled, onClick, ...rest } = this.props;
    const { icon, title, label } = BUTTON_STYLES[type];
    return (
      <Button
        icon={icon}
        type="button"
        title={title}
        content={label}
        onClick={onClick || this.onClick}
        className={this.getBlockClass()}
        disabled={this.isDisabled()}
        {...rest}
      />
    );
  }
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

export default bem(RichTextEditorButton);
