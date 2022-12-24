import React from 'react';
import { Modal, Form, Button } from 'semantic';

import modal from 'helpers/modal';
import AutoFocus from 'components/AutoFocus';
import UrlField from 'components/form-fields/UrlField';
import ErrorMessage from 'components/ErrorMessage';

@modal
export default class AddLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      url: '',
    };
  }

  onLinkChange = (evt, { value }) => {
    this.setState({
      url: value,
    });
  };

  onSubmit = async (evt) => {
    evt.stopPropagation();
    try {
      const { url } = this.state;
      this.props.onSubmit(evt, { value: url });
      this.props.close();
    } catch (error) {
      this.setState({
        error,
      });
    }
  };

  render() {
    const { url, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>Add Link</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form id="add-link" error={!!error} onSubmit={this.onSubmit}>
              <ErrorMessage error={error} />
              <UrlField label="URL" value={url} onChange={this.onLinkChange} />
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="add-link" content="Submit" />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}
