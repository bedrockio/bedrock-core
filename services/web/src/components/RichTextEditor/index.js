import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import Editor from '@draft-js-plugins/editor';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';

import { useClass } from 'helpers/bem';

import Markdown from 'components/Markdown';

import { RichTextEditorContext } from './context';

import {
  getCurrentBlockType,
  toggleBlockType,
  handleKeyCommand,
} from './utils';

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

export default function RichTextEditor(props) {
  const {
    markdown = '',
    short,
    scroll = false,
    disabled,
    children,
    toolbar = false,
    onChange,
    onEnterSubmit,
  } = props;

  const defaultMode = props.mode || 'inline';

  const [mode, setMode] = useState(defaultMode);
  const [editorState, setEditorState] = useState(
    getStateFromMarkdown(markdown),
  );

  const editorRef = useRef();
  const textAreaRef = useRef();

  const { className, getElementClass } = useClass(
    'rich-text-editor',
    short ? 'short' : null,
    scroll ? 'scroll' : null,
    disabled ? 'disabled' : null,
  );

  useEffect(() => {
    resizeTextArea();
  }, []);

  useEffect(() => {
    setEditorState(getStateFromMarkdown(markdown));
    if (mode === 'markdown') {
      resizeTextArea();
    }
  }, [markdown]);

  useEffect(() => {
    setMode(defaultMode);
    resizeTextArea();
  }, [defaultMode]);

  function getStateFromMarkdown(str) {
    const rawObject = markdownToDraft(str);
    return EditorState.createWithContent(convertFromRaw(rawObject));
  }

  function getMarkdownFromState(editorState) {
    const rawObject = convertToRaw(editorState.getCurrentContent());
    return draftToMarkdown(rawObject);
  }

  function resizeTextArea() {
    if (mode === 'markdown') {
      if (!scroll) {
        const el = textAreaRef.current;
        // Reset to auto to force a reflow.
        el.style.height = '';
        // Then set the height to the element scroll height.
        // Extra pixel is to prevent scroll bars from showing
        // occasionally despite being the same height. This
        // might be a retina screen issue.
        el.style.height = `${el.scrollHeight + 1}px`;
      }
    }
  }

  // Events

  function onMarkdownChange(evt) {
    const { value } = evt.target;
    onChange(value);
  }

  function onStateChange(editorState) {
    updateEditorState(editorState);
  }

  function updateEditorState(editorState) {
    setEditorState(editorState);
    const markdown = getMarkdownFromState(editorState);
    if (markdown !== props.markdown) {
      onChange(markdown);
    }
  }

  function handleKey(command, editorState) {
    let newState = editorState;
    if (command === 'backspace') {
      newState = removeCurrentBlockType(editorState);
    } else if (command === 'enter-key-submit') {
      return 'handled';
    }
    newState = handleKeyCommand(editorState, command);
    if (newState) {
      updateEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  function onKeyDown(evt) {
    if (onEnterSubmit && evt.key === 'Enter' && evt.metaKey) {
      onEnterSubmit(evt);
      return 'enter-key-submit';
    }
  }

  function removeCurrentBlockType(editorState) {
    // Draft-js doesn't do this for some reason
    const blockType = getCurrentBlockType(editorState);
    if (blockType) {
      return toggleBlockType(editorState, blockType);
    }
  }

  function renderPresets() {
    if (children) {
      return children;
    } else if (toolbar) {
      return <Toolbar />;
    } else {
      return <InlineToolbar />;
    }
  }

  function renderEditor() {
    const _props = omit(props, Object.keys(RichTextEditor.propTypes));
    if (mode === 'inline') {
      return (
        <Editor
          {..._props}
          plugins={plugins}
          editorState={editorState}
          onChange={onStateChange}
          handleKeyCommand={handleKey}
          keyBindingFn={onKeyDown}
          ref={editorRef}
          readOnly={disabled}
        />
      );
    } else if (mode === 'markdown') {
      return (
        <textarea
          {..._props}
          ref={textAreaRef}
          onChange={onMarkdownChange}
          onKeyDown={onKeyDown}
          spellCheck={false}
          value={markdown}
        />
      );
    } else if (mode === 'preview') {
      return (
        <div {..._props} className={getElementClass('preview')}>
          <Markdown source={markdown} trusted />
        </div>
      );
    }
  }

  return (
    <RichTextEditorContext.Provider
      value={{
        setMode,
        updateEditorState,
      }}>
      <div className={className}>
        {renderPresets()}
        {renderEditor()}
      </div>
    </RichTextEditorContext.Provider>
  );
}

RichTextEditor.Button = Button;
RichTextEditor.Divider = Divider;
RichTextEditor.LinkButton = LinkButton;
RichTextEditor.ImageButton = ImageButton;

RichTextEditor.Toolbar = Toolbar;
RichTextEditor.ModeMenu = ModeMenu;
RichTextEditor.BlockMenu = BlockMenu;
RichTextEditor.ImageButtons = ImageButtons;
RichTextEditor.StateButtons = StateButtons;
RichTextEditor.BlockDropdown = BlockDropdown;
RichTextEditor.InlineToolbar = InlineToolbar;
RichTextEditor.AlignmentMenu = AlignmentMenu;
RichTextEditor.AlignmentButtons = AlignmentButtons;

RichTextEditor.propTypes = {
  markdown: PropTypes.string,
  short: PropTypes.bool,
  scroll: PropTypes.bool,
  toolbar: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onEnterSubmit: PropTypes.func,
};
