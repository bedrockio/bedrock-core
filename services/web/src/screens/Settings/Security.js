import { useState } from 'react';
import {
  Grid,
  Divider,
  Title,
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

import Menu from './Menu';
import Sessions from './components/Sessions';
import TwoFactorAuthentication from './components/TwoFactorAuthentication';
import { IconTrash } from '@tabler/icons-react';

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
                <Stack spacing="xs" mb="xs">
                  {user.authenticators
                    .filter((authenticator) => authenticator.type === 'passkey')
                    .map((passkey) => {
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
              <Fieldset legend="Two-factor authentication" variant="unstyled">
                <TwoFactorAuthentication />
              </Fieldset>
              <Fieldset legend="Sign-in with" variant="unstyled">
                <ErrorMessage error={error} />

                <Title order={4}>Google</Title>
                <div>
                  {hasAuthenticator('google') ? (
                    <GoogleDisableButton onDisabled={onGoogleDisabled} />
                  ) : (
                    <Text>Sign in with Google to enable.</Text>
                  )}
                </div>

                <Divider my="md" />

                <Title order={4}>Apple</Title>
                <div>
                  {hasAuthenticator('apple') ? (
                    <AppleDisableButton onDisabled={onAppleDisabled} />
                  ) : (
                    <Text>Sign in with Apple to enable.</Text>
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
