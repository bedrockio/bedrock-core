import { useState } from 'react';
import { Button, Alert, Stack } from '@mantine/core';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';
import EmailField from 'components/form-fields/Email';
import PhoneField from 'components/form-fields/Phone';
import SearchDropdown from 'components/SearchDropdown';

import { request } from 'utils/api';

export default function SendPreviewModal({
  channel,
  template,
  onSent,
  onClose,
}) {
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
    evt.preventDefault();
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
      onClose();
    } catch (error) {
      setError(error);
      setLoading(false);
    }
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

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing="md">
        <ErrorMessage error={error} />
        {renderField()}
        <Alert color="blue">Dummy data will be used to populate objects.</Alert>
        <Button type="submit" loading={loading} disabled={loading}>
          Send
        </Button>
      </Stack>
    </form>
  );
}
