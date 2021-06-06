import React from 'react';
import { Modal } from 'semantic';
import { modal } from 'helpers';

@modal
export default class OrganizationSelector extends React.Component {

  render() {
    return (
      <React.Fragment>
        <Modal.Header>
          Select Account
        </Modal.Header>
        <Modal.Content>
          Choose account here
        </Modal.Content>
      </React.Fragment>
    );
  }
}
