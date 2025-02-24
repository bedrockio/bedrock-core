import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

import { useClass } from 'helpers/bem';

import { attachEvents } from 'utils/event';

import { useRichTextEditor } from '../context';

import { isImageSelected, getVisibleSelectionRect } from '../utils';
import Button from '../Button';
import Divider from '../Divider';
import LinkButton from '../LinkButton';
import ImageButton from '../ImageButton';

import BlockMenu from './BlockMenu';
import AlignmentMenu from './AlignmentMenu';

import './inline-toolbar.less';

export default function RichTextEditorInlineToolbar(props) {
  const [active, setActive] = useState(false);
  const [sliding, setSliding] = useState(false);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  const { editorState } = useRichTextEditor();

  const { className, getElementClass } = useClass(
    'rich-text-editor-inline-toolbar',
    active ? 'active' : null,
    sliding ? 'sliding' : null
  );

  const ref = useRef();

  // Lifecycle

  useEffect(() => {
    // Debouncing these functions to allow selection to clear
    // also to have a bit of a pause before showing the toolbar.

    function onDocMouseDown() {
      unsetActive();
    }

    const onDocMouseUp = debounce((evt, meta) => {
      const selection = getSelection();
      if (selection.getHasFocus()) {
        if (!selection.isCollapsed() || isImageSelected(editorState)) {
          setRectActive(meta.relatedTarget || evt.target);
        }
      }
    }, 100);

    const onDocLongPress = debounce((evt) => {
      const selection = this.getSelection();
      if (selection.isCollapsed() && selection.getHasFocus()) {
        this.setActive(evt.target);
      }
    }, 100);

    const onDocKeyDown = debounce((evt) => {
      const selection = this.getSelection();
      if (!selection.isCollapsed() && selection.getHasFocus()) {
        this.setActive(evt.target);
      } else {
        this.unsetActive();
      }
    }, 500);

    const events = attachEvents({
      onLongPress: onDocLongPress,
      onMouseDown: onDocMouseDown,
      onMouseUp: onDocMouseUp,
      onKeyDown: onDocKeyDown,
    });

    return () => {
      events.remove();
    };
  }, []);

  // Helpers

  function getSelection() {
    return editorState.getSelection();
  }

  function setRectActive(el) {
    const rect = getVisibleSelectionRect(el);
    if (rect) {
      const { top: offsetTop, left: offsetLeft } =
        el.offsetParent.getBoundingClientRect();
      setActive(true);
      setTop(rect.top - offsetTop);
      setLeft(rect.left - offsetLeft + rect.width / 2);
      setTimeout(() => {
        setSliding(true);
      });
    }
  }

  function unsetActive() {
    setActive(false);
    setSliding(false);
  }

  // Events

  function onMouseDown(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  function onMouseUp(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  function render() {
    return (
      <div ref={ref} className={className} style={renderStyles()}>
        <div
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          className={getElementClass('stage')}>
          {props.children}
        </div>
      </div>
    );
  }

  function renderStyles() {
    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  }

  return render();
}

RichTextEditorInlineToolbar.propTypes = {
  children: PropTypes.node,
};

RichTextEditorInlineToolbar.defaultProps = {
  children: (
    <React.Fragment>
      <Button type="undo" />
      <Button type="redo" />
      <Divider />
      <BlockMenu />
      <Divider />
      <Button type="bold" />
      <Button type="italic" />
      <Button type="code" />
      <Divider />
      <LinkButton />
      <ImageButton />
      <AlignmentMenu />
      <Button type="ordered-list" />
      <Button type="unordered-list" />
    </React.Fragment>
  ),
};
