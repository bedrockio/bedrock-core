import React from 'react';
import { Modal } from 'semantic';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

import modal from 'helpers/modal';

SyntaxHighlighter.registerLanguage('json', json);

class InspectObject extends React.Component {
  render() {
    const { object, name = 'Object' } = this.props;
    return (
      <>
        <Modal.Header>
          Inspect {name}
          {object.name ? `: ${object.name}` : ''}
        </Modal.Header>
        <Modal.Content>
          <SyntaxHighlighter language="json" style={atomDark}>
            {JSON.stringify(object || {}, null, 2)}
          </SyntaxHighlighter>
        </Modal.Content>
      </>
    );
  }
}
export default modal(InspectObject);
