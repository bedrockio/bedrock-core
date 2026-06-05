import { useState } from 'react';

import ErrorMessage from 'components/ErrorMessage';
import { useModalContext } from 'components/ModalWrapper';
import Actions from 'components/form-fields/Actions';
import NativeSelect from 'components/form-fields/NativeSelect';
import { useFields } from 'hooks/forms';
import { useRequest } from 'hooks/request';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { request } from 'utils/api';

export default function InviteForm(props) {
  const { close } = useModalContext();

  const [input, setInput] = useState('');

  const { fields, setField } = useFields({
    role: 'viewer',
  });

  const { run, loading, error } = useRequest(async (body) => {
    await request({
      method: 'POST',
      path: '/1/invites',
      body,
    });
    await props.onSuccess?.();
    close();
  });

  function onSubmit(evt) {
    evt.preventDefault();
    run(fields);
  }

  function onEmailsBlur() {
    setField({
      name: 'emails',
      value: input.trim().split(/,\s+/),
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ErrorMessage error={error} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="emails">Emails</Label>
        <Textarea
          id="emails"
          rows="5"
          value={input}
          onChange={(evt) => {
            setInput(evt.target.value);
          }}
          onBlur={onEmailsBlur}
          placeholder="Enter email addresses separated by comma or new line."
        />
      </div>

      <NativeSelect
        name="role"
        label="Role"
        placeholder="Choose Role"
        onChange={setField}
        value={fields.role || ''}
        options={[
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
        <Button type="submit" disabled={loading}>
          {loading && <Spinner />}
          Invite Members
        </Button>
      </Actions>
    </form>
  );
}
