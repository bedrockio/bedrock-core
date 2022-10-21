import React from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

import { attachEvents } from '/utils/event';
import bem from '/helpers/bem';

import { isImageSelected, getVisibleSelectionRect } from '../utils';
import Button from '../Button';
import Divider from '../Divider';
import LinkButton from '../LinkButton';
import ImageButton from '../ImageButton';

import BlockMenu from './BlockMenu';
import AlignmentMenu from './AlignmentMenu';

import './inline-toolbar.less';

class RichTextEditorInlineToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      sliding: false,
      top: 0,
      left: 0,
      linkSelection: null,
      showImageModal: false,
    };
    this.ref = React.createRef();
  }

  // Lifecycle

  componentDidMount() {
    this.events = attachEvents({
      onLongPress: this.onDocLongPress,
      onMouseDown: this.onDocMouseDown,
      onMouseUp: this.onDocMouseUp,
      onKeyDown: this.onDocKeyDown,
    });
  }

  componentWillUnmount() {
    this.events.remove();
  }

  // Bem

  getModifiers() {
    const { active, sliding } = this.state;
    return [active ? 'active' : null, sliding ? 'sliding' : null];
  }

  // Helpers

  getSelection() {
    return this.context.editorState.getSelection();
  }

  setActive(el) {
    const rect = getVisibleSelectionRect(el);
    if (rect) {
      const { top: offsetTop, left: offsetLeft } =
        el.offsetParent.getBoundingClientRect();
      this.setState({
        active: true,
        top: rect.top - offsetTop,
        left: rect.left - offsetLeft + rect.width / 2,
      });
      setTimeout(() => {
        this.setState({
          sliding: true,
        });
      });
    }
  }

  unsetActive() {
    this.setState({
      active: false,
      sliding: false,
    });
  }

  // Events

  onMouseDown = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
  };

  onMouseUp = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
  };

  // Document Events
  //
  // Debouncing these functions to allow selection to clear
  // also to have a bit of a pause before showing the toolbar.

  onDocMouseDown = () => {
    this.unsetActive();
  };

  onDocMouseUp = debounce((evt, meta) => {
    const { editorState } = this.context;
    const selection = this.getSelection();
    if (selection.getHasFocus()) {
      if (!selection.isCollapsed() || isImageSelected(editorState)) {
        this.setActive(meta.relatedTarget || evt.target);
      }
    }
  }, 100);

  onDocLongPress = debounce((evt) => {
    const selection = this.getSelection();
    if (selection.isCollapsed() && selection.getHasFocus()) {
      this.setActive(evt.target);
    }
  }, 100);

  onDocKeyDown = debounce((evt) => {
    const selection = this.getSelection();
    if (!selection.isCollapsed() && selection.getHasFocus()) {
      this.setActive(evt.target);
    } else {
      this.unsetActive();
    }
  }, 500);

  render() {
    return (
      <div
        ref={this.ref}
        className={this.getBlockClass()}
        style={this.renderStyles()}>
        <div
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          className={this.getElementClass('stage')}>
          {this.props.children}
        </div>
      </div>
    );
  }

  renderStyles() {
    const { top, left } = this.state;
    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  }
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

export default bem(RichTextEditorInlineToolbar);
