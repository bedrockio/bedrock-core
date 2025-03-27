import React from 'react';
import { Modal, Message } from 'semantic';

import modal from 'helpers/modal';

import Code from 'components/Code';

function Help() {
  function render() {
    return (
      <React.Fragment>
        <Modal.Header>Template Help</Modal.Header>
        <Modal.Content className="template-help-modal">
          <h4 style={{ marginTop: '0' }}>Metadata</h4>
          <Code>
            {`
---
subject: Subject here.
image: "{{imageUrl user.profileImage}}"
---
Body here.
`.trim()}
          </Code>
          <Message warning>
            Note that quotes are optional except when the value starts with{' '}
            <code>&#123;&#123;</code>
          </Message>
          <h4>Conditional Rendering</h4>
          <Code>
            {`
{{#if user}}
  Your name is {{user.name}}.
{{/if}}
`.trim()}
          </Code>
          <h4>Image Helpers</h4>
          <Code>
            {`
{{image user.profileImage}}
{{image user.profileImage type=avatar}}
{{image user.profileImage width=150 height=150}}
{{image user.profileImage blur=50}}
{{imageUrl user.profileImage}}
`.trim()}
          </Code>
          <h4>Date/Time Helpers</h4>
          <Code>
            {`
{{date startsAt}}
{{time startsAt}}
`.trim()}
          </Code>
          <h4>Relative Time Helpers</h4>
          <Code>
            {`
{{rtime startsAt}}
`.trim()}
          </Code>
        </Modal.Content>
      </React.Fragment>
    );
  }

  return render();
}

export default modal(Help);
