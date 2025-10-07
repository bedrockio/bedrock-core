import { Button, NativeSelect, Textarea } from '@mantine/core';
import { useState } from 'react';

import ErrorMessage from 'components/ErrorMessage';
import { useModalContext } from 'components/ModalWrapper';
import Actions from 'components/form-fields/Actions';
import { useFields } from 'hooks/forms';
import { useRequest } from 'hooks/request';

import { request } from 'utils/api';

export default function InviteForm(props) {
  const { close } = useModalContext();

  const [input, setInput] = useState('');
  const [body, setField] = useFields({
    role: 'viewer',
  });

  const { run, loading, error } = useRequest(async () => {
    await request({
      method: 'POST',
      path: '/1/invites',
      body,
    });
    await props.onSuccess?.();
    close();
  });

  function onEmailsBlur() {
    setField({
      name: 'emails',
      value: input.trim().split(/,\s+/),
    });
  }

  return (
    <form onSubmit={run}>
      <ErrorMessage error={error} />

      <Textarea
        rows="5"
        label="Emails"
        value={input}
        onChange={(evt) => {
          setInput(evt.target.value);
        }}
        onBlur={onEmailsBlur}
        placeholder="Enter email addresses separated by comma or new line."
      />

      <NativeSelect
        name="role"
        label="Role"
        placeholder="Choose Role"
        onChange={setField}
        value={body.role || ''}
        data={[
          {
            label: 'Viewer',
            value: 'viewer',
          },
          {
            label: 'Admin',
            value: 'admin',
          },
          {
            label: 'Super Admin',
            value: 'superAdmin',
          },
        ]}
      />
      <Actions>
        <Button type="submit" loading={loading}>
          Invite Members
        </Button>
      </Actions>
    </form>
  );
}
