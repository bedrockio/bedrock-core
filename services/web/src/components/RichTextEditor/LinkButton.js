import React from 'react';
import { addLink, toggleLink, currentBlockContainsLink } from './utils';

import AddLinkModal from './modals/AddLink';
import Button from './Button';

import './button.less';

export default class ImageButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: null,
    };
  }

  onClick = () => {
    const { editorState, updateState } = this.context;
    const selection = editorState.getSelection();
    if (currentBlockContainsLink(editorState)) {
      updateState(toggleLink(editorState, selection, null));
    } else if (!selection.isCollapsed()) {
      this.setState({
        selection,
      });
    }
  };

  onClose = () => {
    this.setState({
      selection: null,
    });
  };

  onSubmit = (evt, { value }) => {
    const { editorState, updateState } = this.context;
    const { selection } = this.state;
    updateState(
      addLink(editorState, {
        url: value,
        selection,
      })
    );
  };

  render() {
    const { editorState } = this.context;
    return (
      <React.Fragment>
        <Button
          type="link"
          onClick={this.onClick}
          toggled={currentBlockContainsLink(editorState)}
          disabled={editorState.getSelection().isCollapsed()}
        />
        {this.renderLinkModal()}
      </React.Fragment>
    );
  }

  renderLinkModal() {
    const { selection } = this.state;
    return (
      <AddLinkModal
        open={!!selection}
        onClose={this.onClose}
        onSubmit={this.onSubmit}
      />
    );
  }
}
