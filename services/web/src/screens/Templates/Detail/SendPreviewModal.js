import React, { useState } from 'react';
import { Form, Button, Message, Modal } from 'semantic';

import modal from 'helpers/modal';
import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';
import SearchDropdown from 'components/SearchDropdown';

import { request } from 'utils/api';

function SendPreviewModal(props) {
  const { channel, template, close, onSent } = props;

  const { user } = useSession();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(() => {
    if (channel === 'email') {
      return { email: user.email };
    } else if (channel === 'sms') {
      return { phone: user.phone };
    } else if (channel === 'push') {
      return { userId: user.id };
    }
  });

  function setField(evt, { name, value }) {
    setFields({
      ...fields,
      [name]: value,
    });
  }

  async function onSubmit(evt) {
    evt.stopPropagation();
    try {
      setError(null);
      setLoading(true);
      await request({
        method: 'POST',
        path: `/1/templates/${template.id}/send`,
        body: {
          channel,
          ...fields,
        },
      });
      setLoading(false);
      onSent();
      close();
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Modal.Header>Send Test</Modal.Header>
        <Modal.Content>
          <Form noValidate id="send-mail" onSubmit={onSubmit}>
            <ErrorMessage error={error} />
            {renderField()}
          </Form>
          <Message>Dummy data will be used to populate objects.</Message>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="send-mail"
            loading={loading}
            disabled={loading}
            content="Send"
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }

  function renderField() {
    if (channel === 'email') {
      return renderEmail();
    } else if (channel === 'sms') {
      return renderSms();
    } else if (channel === 'push') {
      return renderPush();
    }
  }

  function renderEmail() {
    return (
      <EmailField
        name="email"
        label="Email"
        value={fields.email || ''}
        onChange={setField}
      />
    );
  }

  function renderSms() {
    return (
      <PhoneField
        name="phone"
        label="Phone"
        value={fields.phone || ''}
        onChange={setField}
      />
    );
  }

  function renderPush() {
    return (
      <SearchDropdown
        label="User"
        name="userId"
        value={fields.userId || ''}
        searchPath="/1/templates/push-users/search"
        placeholder="Search Users"
        onChange={setField}
      />
    );
  }

  return render();
}

export default modal(SendPreviewModal);
