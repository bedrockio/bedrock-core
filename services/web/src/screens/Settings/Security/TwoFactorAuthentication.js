import { Button, Select, Text, Stack, Group } from '@mantine/core';
import { useSession } from 'stores/session';
import { useRequest } from 'utils/api';

import { notifications } from '@mantine/notifications';

import ModalWrapper from 'components/ModalWrapper';

import Authenticator from 'components/Authenticator';

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
      return (
        <ModalWrapper
          title="Enable Authenticator"
          component={
            <Authenticator
              onSuccess={() => {
                notifications.show({
                  position: 'top-right',
                  title: 'Success',
                  message: 'Two-factor authentication enabled.',
                  color: 'green',
                });
              }}
            />
          }
        />
      );
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
    <Stack gap="xs">
      <Text size="sm">Select how you want to verify your identity</Text>
      <Select
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
        <Group>
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              removeTotpRequest.request();
            }}
            loading={removeTotpRequest.loading}
            disabled={removeTotpRequest.loading}
            color="red">
            Reset Authenticator Configuration
          </Button>
        </Group>
      )}
    </Stack>
  );
}
