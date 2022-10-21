import React from 'react';

import { addImage } from './utils';
import AddImageModal from './modals/AddImage';
import Button from './Button';

import './button.less';

export default class ImageButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  onClick = () => {
    this.setState({
      showModal: true,
    });
  };

  onClose = () => {
    this.setState({
      showModal: false,
    });
  };

  onSubmit = (evt, { url, title }) => {
    const { editorState, updateEditorState } = this.context;
    updateEditorState(addImage(editorState, { url, title }));
  };

  render() {
    return (
      <React.Fragment>
        <Button type="image" onClick={this.onClick} />
        {this.renderImageModal()}
      </React.Fragment>
    );
  }

  renderImageModal() {
    const { showModal } = this.state;
    return (
      <AddImageModal
        open={showModal}
        onClose={this.onClose}
        onSubmit={this.onSubmit}
      />
    );
  }
}
