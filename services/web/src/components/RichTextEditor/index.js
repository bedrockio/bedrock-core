import React from 'react';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import Editor from '@draft-js-plugins/editor';
import { EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';

import bem from 'helpers/bem';

import Markdown from 'components/Markdown';

import { markdownToDraft, draftToMarkdown } from './utils/draft';
import Button from './Button';
import Divider from './Divider';
import LinkButton from './LinkButton';
import ImageButton from './ImageButton';
import Toolbar from './presets/Toolbar';
import ModeMenu from './presets/ModeMenu';
import BlockMenu from './presets/BlockMenu';
import ImageButtons from './presets/ImageButtons';
import StateButtons from './presets/StateButtons';
import InlineToolbar from './presets/InlineToolbar';
import BlockDropdown from './presets/BlockDropdown';
import AlignmentMenu from './presets/AlignmentMenu';
import AlignmentButtons from './presets/AlignmentButtons';
import plugins from './plugins';

import './rich-text-editor.less';

const Context = React.createContext();

Button.contextType = Context;
Divider.contextType = Context;
LinkButton.contextType = Context;
ImageButton.contextType = Context;

Toolbar.contextType = Context;
ModeMenu.contextType = Context;
BlockMenu.contextType = Context;
ImageButtons.contextType = Context;
StateButtons.contextType = Context;
InlineToolbar.contextType = Context;
BlockDropdown.contextType = Context;
AlignmentMenu.contextType = Context;
AlignmentButtons.contextType = Context;

class RichTextEditor extends React.Component {
  static Button = Button;
  static Divider = Divider;
  static LinkButton = LinkButton;
  static ImageButton = ImageButton;

  static Toolbar = Toolbar;
  static ModeMenu = ModeMenu;
  static BlockMenu = BlockMenu;
  static ImageButtons = ImageButtons;
  static StateButtons = StateButtons;
  static BlockDropdown = BlockDropdown;
  static InlineToolbar = InlineToolbar;
  static AlignmentMenu = AlignmentMenu;
  static AlignmentButtons = AlignmentButtons;

  constructor(props) {
    super(props);
    const { markdown } = props;
    this.state = {
      mode: props.mode,
      editorState: this.getStateFromMarkdown(markdown),
    };
    this.textAreaRef = React.createRef();
  }

  componentDidMount() {
    this.resizeTextArea();
  }

  componentDidUpdate(lastProps, lastState) {
    this.checkMarkdownChange(lastProps);
    this.checkModeChange(lastProps, lastState);
  }

  // Update editor state and resize text are if markdown has changed. Only do
  // this in markdown mode as the editor will lose selection state when inline.
  checkMarkdownChange(lastProps) {
    const { mode } = this.state;
    const { markdown } = this.props;
    const { markdown: lastMarkdown } = lastProps;
    if (mode === 'markdown' && markdown !== lastMarkdown) {
      this.updateState(this.getStateFromMarkdown(markdown));
      this.resizeTextArea();
    }
  }

  checkModeChange(lastProps, lastState) {
    if (this.props.mode !== lastProps.mode) {
      this.setState({
        mode: this.props.mode,
      });
    } else if (this.state.mode !== lastState.mode) {
      if (this.state.mode === 'markdown') {
        this.resizeTextArea();
      }
    }
  }

  setMode = (mode) => {
    this.setState({
      mode,
    });
  };

  getModifiers() {
    const { short, scroll, disabled } = this.props;
    return [
      short ? 'short' : null,
      scroll ? 'scroll' : null,
      disabled ? 'disabled' : null,
    ];
  }

  getStateFromMarkdown(str) {
    const rawObject = markdownToDraft(str);
    return EditorState.createWithContent(convertFromRaw(rawObject));
  }

  getMarkdownFromState(editorState) {
    const rawObject = convertToRaw(editorState.getCurrentContent());
    return draftToMarkdown(rawObject);
  }

  resizeTextArea = () => {
    if (this.state.mode === 'markdown') {
      const { scroll } = this.props;
      if (!scroll) {
        const el = this.textAreaRef.current;
        // Reset to auto to force a reflow.
        el.style.height = '';
        // Then set the height to the element scroll height.
        // Extra pixel is to prevent scroll bars from showing
        // occasionally despite being the same height. This
        // might be a retina screen issue.
        el.style.height = `${el.scrollHeight + 1}px`;
      }
    }
  };

  // Events

  onMarkdownChange = (evt) => {
    const { name, value } = evt.target;
    this.props.onChange(evt, {
      name,
      value,
    });
  };

  onStateChange = (editorState) => {
    this.updateState(editorState);
    const markdown = this.getMarkdownFromState(editorState);
    if (markdown !== this.props.markdown) {
      // Required as this is a fake onChange event.
      const evt = new CustomEvent('change');
      this.props.onChange(evt, {
        ...this.props,
        value: markdown,
      });
    }
  };

  updateState = (editorState) => {
    this.setState({
      editorState,
    });
  };

  handleKeyCommand = (command, editorState) => {
    let newState = editorState;
    if (command === 'backspace') {
      newState = this.removeCurrentBlockType(editorState);
    } else if (command === 'enter-key-submit') {
      return 'handled';
    }
    newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.updateState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  onKeyDown = (evt) => {
    const { onEnterSubmit } = this.props;
    if (onEnterSubmit && evt.key === 'Enter' && evt.metaKey) {
      onEnterSubmit(evt);
      return 'enter-key-submit';
    }
  };

  removeCurrentBlockType = (editorState) => {
    // Draft-js doesn't do this for some reason
    const blockType = RichUtils.getCurrentBlockType(editorState);
    if (blockType) {
      return RichUtils.toggleBlockType(editorState, blockType);
    }
  };

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          setMode: this.setMode,
          updateState: this.updateState,
        }}>
        <div className={this.getBlockClass()}>
          {this.renderPresets()}
          {this.renderEditor()}
        </div>
      </Context.Provider>
    );
  }

  renderPresets() {
    const { children, toolbar } = this.props;
    if (children) {
      return children;
    } else if (toolbar) {
      return <Toolbar />;
    } else {
      return <InlineToolbar />;
    }
  }

  renderEditor() {
    const { markdown, disabled } = this.props;
    const { mode, editorState } = this.state;
    const props = omit(this.props, Object.keys(RichTextEditor.propTypes));
    if (mode === 'inline') {
      return (
        <Editor
          {...props}
          plugins={plugins}
          editorState={editorState}
          onChange={this.onStateChange}
          handleKeyCommand={this.handleKeyCommand}
          keyBindingFn={this.onKeyDown}
          readOnly={disabled}
        />
      );
    } else if (mode === 'markdown') {
      return (
        <textarea
          {...props}
          ref={this.textAreaRef}
          onChange={this.onMarkdownChange}
          onKeyDown={this.onKeyDown}
          spellCheck={false}
          value={markdown}
        />
      );
    } else if (mode === 'preview') {
      return (
        <div {...props} className={this.getElementClass('preview')}>
          <Markdown source={markdown} trusted />
        </div>
      );
    }
  }
}

RichTextEditor.propTypes = {
  markdown: PropTypes.string,
  short: PropTypes.bool,
  scroll: PropTypes.bool,
  toolbar: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onEnterSubmit: PropTypes.func,
};

RichTextEditor.defaultProps = {
  mode: 'inline',
  markdown: '',
  scroll: false,
  toolbar: false,
};

export default bem(RichTextEditor);
