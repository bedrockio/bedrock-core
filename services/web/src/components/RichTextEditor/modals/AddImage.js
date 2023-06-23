import React from 'react';
import { Modal, Form, Button } from 'semantic';

import modal from 'helpers/modal';

import UploadsField from 'components/form-fields/Uploads';
import ErrorMessage from 'components/ErrorMessage';

import { urlForUpload } from 'utils/uploads';

@modal
export default class AddImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      title: '',
      upload: null,
    };
  }

  onImageChange = (evt, { value }) => {
    this.setState({
      upload: value,
      title: value.filename,
    });
  };
  onChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
    });
  };

  onSubmit = async (evt) => {
    evt.stopPropagation();
    const { upload, title } = this.state;
    this.props.onSubmit(evt, {
      url: urlForUpload(upload),
      title,
    });
    this.props.close();
  };

  render() {
    const { upload, title, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>Upload Image</Modal.Header>
        <Modal.Content>
          <Form id="add-image" error={!!error} onSubmit={this.onSubmit}>
            <ErrorMessage error={error} />
            <UploadsField
              name="upload"
              label="Image"
              value={upload}
              onChange={this.onImageChange}
              onError={(error) => this.setState({ error })}
            />
            {upload && (
              <Form.Input
                name="title"
                label="Title"
                value={title}
                onChange={this.onChange}
              />
            )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="add-image"
            loading={loading}
            disabled={loading || !upload}
            content="Submit"
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}
