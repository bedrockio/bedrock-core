import { useState } from 'react';
import {
  Grid,
  Divider,
  Button,
  Group,
  LoadingOverlay,
  Text,
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

import Menu from '../Menu';
import Sessions from './Sessions';
import TwoFactorAuthentication from './TwoFactorAuthentication';
import { PiTrashFill } from 'react-icons/pi';

export default function Security() {
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

  const { loading, error } = state;

  return (
    <Stack>
      <Meta title="Security" />
      <Menu />
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <Fieldset legend="Passkey" variant="unstyled">
                <Stack gap="xs">
                  {user.authenticators
                    .filter((authenticator) => authenticator.type === 'passkey')
                    .map((passkey) => {
                      const { id, name, createdAt, lastUsedAt } = passkey;
                      return (
                        <Group justify="space-between" align="center" key={id}>
                          <Stack gap="0">
                            <Text size="sm">{name}</Text>
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
                            <PiTrashFill />
                          </ActionIcon>
                        </Group>
                      );
                    })}
                  <Group>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={onCreatePasskeyClick}>
                      Add Passkey
                    </Button>
                  </Group>
                </Stack>
              </Fieldset>
              <Fieldset legend="Two-factor authentication" variant="unstyled">
                <TwoFactorAuthentication />
              </Fieldset>
              <Fieldset legend="Sign-in with" variant="unstyled">
                <ErrorMessage error={error} />

                <Text size="sm" fw="bold">
                  Google
                </Text>
                <div>
                  {hasAuthenticator('google') ? (
                    <GoogleDisableButton onDisabled={onGoogleDisabled} />
                  ) : (
                    <Text size="sm">Sign in with Google to enable.</Text>
                  )}
                </div>

                <Divider my="md" />

                <Text size="sm" fw="bold">
                  Apple
                </Text>
                <div>
                  {hasAuthenticator('apple') ? (
                    <AppleDisableButton onDisabled={onAppleDisabled} />
                  ) : (
                    <Text size="sm">Sign in with Apple to enable.</Text>
                  )}
                </div>
              </Fieldset>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Fieldset mt="md" legend="Sessions" variant="unstyled">
              <Sessions />
            </Fieldset>
          </Grid.Col>
        </Grid>
      </div>
    </Stack>
  );
}
