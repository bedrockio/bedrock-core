import { useState } from 'react';
import {
  Grid,
  Divider,
  Alert,
  Title,
  Button,
  Group,
  LoadingOverlay,
  Text,
  Select,
  Stack,
  Fieldset,
  ActionIcon,
} from '@mantine/core';

import { useSession } from 'stores/session';

import Meta from 'components/Meta';

import ErrorMessage from 'components/ErrorMessage';
import AppleDisableButton from 'components/Auth/Apple/DisableButton';
import GoogleDisableButton from 'components/Auth/Google/DisableButton';

import { createPasskey, removePasskey } from 'utils/auth/passkey';
import { formatDate, fromNow } from 'utils/date';

import { request } from 'utils/api';

import Menu from './Menu';
import Sessions from './components/Sessions';
import Authenticator from './components/Authenticator';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

export default function Security(props) {
  const { user, updateUser } = useSession();

  const [state, setState] = useState({
    error: null,
    loading: false,
    message: null,
  });

  const setLoading = (loading) => setState((prev) => ({ ...prev, loading }));
  const setMessage = (message) => setState((prev) => ({ ...prev, message }));
  const resetState = () =>
    setState({ error: null, message: null, loading: true });

  // Federated
  const onGoogleEnabled = () => {
    setMessage('Enabled Google Login');
  };

  const onGoogleDisabled = () => {
    setMessage('Disabled Google Login');
  };

  const onAppleEnabled = () => {
    setMessage('Enabled Apple Login');
  };

  const onAppleDisabled = () => {
    setMessage('Disabled Apple Login');
  };

  // Passkey
  const onCreatePasskeyClick = async () => {
    try {
      resetState();
      const result = await createPasskey();
      if (result) {
        const { data } = result;
        updateUser(data);
        setMessage('Passkey added.');
      }
      setLoading(false);
    } catch (error) {
      setState({
        error,
        loading: false,
        message: null,
      });
    }
  };

  const deletePasskey = async (passkey) => {
    try {
      resetState();
      const { data } = await removePasskey(passkey);
      updateUser(data);
      setState({
        loading: false,
        message: 'Passkey disabled',
        error: null,
      });
    } catch (error) {
      setState({
        error,
        loading: false,
        message: null,
      });
    }
  };

  // MFA

  const hasAuthenticator = (type) => {
    return user.authenticators.find(
      (authenticator) => authenticator.type === type,
    );
  };

  const removeTotp = async () => {
    try {
      resetState();
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/totp/disable',
      });
      updateUser(data);
      setLoading(false);
    } catch (error) {
      setState({
        error,
        loading: false,
        message: null,
      });
    }
  };

  const getMfaMessage = (method) => {
    return method === 'none'
      ? 'Two-factor authentication disabled.'
      : 'Two-factor authentication enabled.';
  };

  const onMfaMethodChange = async (value) => {
    if (value === 'totp' && !hasTotp) {
      modals.open({
        title: 'Enable Authenticator',
        children: <Authenticator onClose={() => modals.closeAll()} />,
      });
    } else {
      try {
        resetState();
        const { data } = await request({
          method: 'PATCH',
          path: '/1/auth/mfa-method',
          body: {
            method: value,
          },
        });

        updateUser({
          mfaMethod: data.mfaMethod,
          authenticators: data.authenticators,
        });
        setState({
          loading: false,
          message: getMfaMessage(value),
          error: null,
        });
      } catch (error) {
        setState({
          error,
          loading: false,
          message: null,
        });
      }
    }
  };

  const { loading, error } = state;
  const { mfaMethod } = user;
  const passkeys = user.authenticators.filter(
    (authenticator) => authenticator.type === 'passkey',
  );
  const hasTotp = user.authenticators.some(
    (authenticator) => authenticator.type === 'totp',
  );

  return (
    <>
      <Meta title="Security" />
      <Menu />
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset mt="md" legend="Passkey" variant="filled">
              <Stack spacing="xs" mb="xs">
                {passkeys.map((passkey) => {
                  const { id, name, createdAt, lastUsedAt } = passkey;
                  return (
                    <Group justify="space-between" align="center" key={id}>
                      <Stack gap="0">
                        <Text fw="bold">{name}</Text>
                        <Text size="sm">
                          Added on {formatDate(createdAt)} | Last used{' '}
                          {fromNow(lastUsedAt)}
                        </Text>
                      </Stack>
                      <ActionIcon
                        title="Delete"
                        variant="transparent"
                        loading={loading}
                        disabled={loading}
                        onClick={() => deletePasskey(passkey)}>
                        <IconTrash color="red" size={16} />
                      </ActionIcon>
                    </Group>
                  );
                })}
              </Stack>

              <Button variant="outline" onClick={onCreatePasskeyClick}>
                Add Passkey
              </Button>
            </Fieldset>
            <Fieldset
              mt="md"
              legend="Two-factor authentication"
              variant="filled">
              <Text size="sm">Select how you want to verify your identity</Text>
              <Select
                mt="xs"
                value={mfaMethod}
                onChange={onMfaMethodChange}
                data={[
                  { label: 'None', value: 'none' },
                  { label: 'SMS', value: 'sms' },
                  { label: 'Email', value: 'email' },
                  { label: 'Authenticator', value: 'totp' },
                ]}
              />

              {/* MFA Authenticator Section */}
              {hasTotp && mfaMethod === 'totp' && (
                <Button
                  mt="xs"
                  variant="outline"
                  onClick={removeTotp}
                  loading={loading}
                  size="sm"
                  color="red">
                  Reset
                </Button>
              )}
            </Fieldset>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset mt="md" legend="Auth Providers" variant="filled">
              <ErrorMessage error={error} />

              {/* Google Section */}
              <Title order={4}>Google</Title>
              <div>
                {hasAuthenticator('google') ? (
                  <GoogleDisableButton onDisabled={onGoogleDisabled} />
                ) : (
                  <Text>Sign in with Google to enable.</Text>
                )}
              </div>

              <Divider my="md" />

              {/* Apple Section */}
              <Title order={4}>Apple</Title>
              <div>
                {hasAuthenticator('apple') ? (
                  <AppleDisableButton onDisabled={onAppleDisabled} />
                ) : (
                  <Text>Sign in with Apple to enable.</Text>
                )}
              </div>
            </Fieldset>
            <Fieldset mt="md" legend="Sessions" variant="filled">
              <Sessions />
            </Fieldset>
          </Grid.Col>
        </Grid>
      </div>
    </>
  );
}
