import { useNavigate } from '@bedrockio/router';
import { Button, Paper, Stack, TextInput } from '@mantine/core';

import { showSuccessNotification } from 'helpers/notifications';

import ErrorMessage from 'components/ErrorMessage';
import Actions from 'components/form-fields/Actions';
import ChipsField from 'components/form-fields/Chips';
import { useFields } from 'hooks/forms';
import { useRequest } from 'hooks/request';

import { request } from 'utils/api';

export default function TemplateForm(props) {
  const { template, onSuccess } = props;

  const { fields, setField } = useFields(template);
  const navigate = useNavigate();

  const { run, loading, error } = useRequest(async (body) => {
    if (template) {
      await request({
        method: 'PATCH',
        path: `/1/templates/${template.id}`,
        body,
      });
    } else {
      await request({
        method: 'POST',
        path: '/1/templates',
        body,
      });
    }

    showSuccessNotification({
      message: 'Added routine',
    });

    onSuccess?.();
  });

  function onSubmit(evt) {
    evt.preventDefault();
    run(fields);
  }

  function onCancelClick() {
    navigate.back();
  }

  return (
    <form onSubmit={onSubmit}>
      <Paper p="md" withBorder>
        <Stack>
          <ErrorMessage error={error} />
          <TextInput
            required
            label="Name"
            name="name"
            value={fields.name || ''}
            onChange={setField}
          />
          <ChipsField
            name="channels"
            label="Channels"
            value={fields.channels || []}
            options={[
              {
                label: 'Email',
                value: 'email',
              },
              {
                label: 'SMS',
                value: 'sms',
              },
              {
                label: 'Push',
                value: 'push',
              },
            ]}
            onChange={setField}
          />
        </Stack>
      </Paper>
      <Actions>
        <Button
          variant="default"
          loading={loading}
          disabled={loading}
          onClick={onCancelClick}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {template ? 'Update' : 'Create'}
        </Button>
      </Actions>
    </form>
  );
}
