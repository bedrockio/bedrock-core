import React from 'react';
import { Modal } from 'semantic';
import modal from 'helpers/modal';

import RequestBlock from 'screens/Docs/RequestBlock';
import { API_URL } from 'utils/env';

@modal
export default class ShowRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,

      title: '',

      tab: 'request',
    };
  }

  render() {
    return (
      <>
        <Modal.Header>Request for web-fG5dO6TUiF3Qj8nt</Modal.Header>

        <Modal.Content scrolling>
          <RequestBlock baseUrl={API_URL} request={this.props.request} />
        </Modal.Content>
      </>
    );
  }
}
