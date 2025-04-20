import { Button, Select, Text } from '@mantine/core';
import { useSession } from 'stores/session';
import { useRequest } from 'utils/api';

import { notifications } from '@mantine/notifications';

import { modals } from '@mantine/modals';

import Authenticator from './Authenticator';

export default function Sessions() {
  const { user, updateUser } = useSession();

  const mfaRequest = useRequest({
    manual: true,
    method: 'PATCH',
    path: '/1/auth/mfa-method',
    onSuccess: ({ data }) => {
      updateUser({
        mfaMethod: data.mfaMethod,
        authenticators: data.authenticators,
      });

      notifications.show({
        position: 'top-right',
        title: 'Success',
        message:
          data.mfaMethod === 'none'
            ? 'Two-factor authentication disabled.'
            : 'Two-factor authentication enabled.',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        position: 'top-right',
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const removeTotpRequest = useRequest({
    manual: true,
    method: 'POST',
    path: '/1/auth/totp/disable',
    onSuccess: ({ data }) => {
      updateUser({
        mfaMethod: data.mfaMethod,
        authenticators: data.authenticators,
      });
    },
    onError: (error) => {
      notifications.show({
        position: 'top-right',
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  function onMfaMethodChange(value) {
    if (value === 'totp' && !hasTotp) {
      modals.open({
        title: 'Enable Authenticator',
        children: (
          <Authenticator
            onClose={() => modals.closeAll()}
            onSuccess={() => {
              notifications.show({
                position: 'top-right',
                title: 'Success',
                message: 'Two-factor authentication enabled.',
                color: 'green',
              });
            }}
          />
        ),
      });
    } else {
      mfaRequest.request({
        body: {
          method: value,
        },
      });
    }
  }

  const hasTotp = user.authenticators.some(
    (authenticator) => authenticator.type === 'totp',
  );

  return (
    <>
      <Text size="sm">Select how you want to verify your identity</Text>
      <Select
        mt="xs"
        value={user.mfaMethod}
        loading={mfaRequest.loading}
        disabled={mfaRequest.loading}
        onChange={onMfaMethodChange}
        data={[
          { label: 'None', value: 'none' },
          { label: 'SMS', value: 'sms' },
          { label: 'Email', value: 'email' },
          { label: 'Authenticator', value: 'totp' },
        ]}
      />

      {hasTotp && user.mfaMethod === 'totp' && (
        <Button
          mt="xs"
          variant="outline"
          onClick={() => {
            removeTotpRequest.request();
          }}
          loading={removeTotpRequest.loading}
          disabled={removeTotpRequest.loading}
          size="sm"
          color="red">
          Reset Authenticator Configuration
        </Button>
      )}
    </>
  );
}
