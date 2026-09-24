import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { useSession } from 'stores/session';

import AppleDisableButton from 'components/Auth/Apple/DisableButton';
import GoogleDisableButton from 'components/Auth/Google/DisableButton';
import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import {
  canShowPasskey,
  createPasskey,
  removePasskey,
} from 'utils/auth/passkey';
import { formatDate, fromNow } from 'utils/date';

import Sessions from './Sessions';
import TwoFactorAuthentication from './TwoFactorAuthentication';

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
  // const onGoogleEnabled = () => {
  //   setMessage('Enabled Google Login');
  // };

  const onGoogleDisabled = () => {
    setMessage('Disabled Google Login');
  };

  // const onAppleEnabled = () => {
  //   setMessage('Enabled Apple Login');
  // };

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

  const passkeys = user.authenticators.filter(
    (authenticator) => authenticator.type === 'passkey',
  );
  const canAddPasskey = canShowPasskey();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Security" />
      <div className="relative flex max-w-2xl flex-col gap-6">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Spinner className="size-6" />
          </div>
        )}
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
          {(canAddPasskey || passkeys.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Passkey</CardTitle>
                <CardDescription>
                  Sign in without a password using a passkey on your device.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {passkeys.map((passkey) => {
                  const { id, name, createdAt, lastUsedAt } = passkey;
                  return (
                    <div
                      className="flex items-center justify-between gap-4"
                      key={id}>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-muted-foreground text-xs">
                          Added {formatDate(createdAt)} · Last used{' '}
                          {fromNow(lastUsedAt)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        disabled={loading}
                        onClick={() => deletePasskey(passkey)}>
                        <Trash2 />
                      </Button>
                    </div>
                  );
                })}
                {canAddPasskey && (
                  <div className="flex">
                    <Button variant="outline" onClick={onCreatePasskeyClick}>
                      Add Passkey
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>
                Require a second step at sign-in for extra security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TwoFactorAuthentication />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign-in with</CardTitle>
            <CardDescription>
              Connect a provider to sign in faster.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorMessage error={error} />

            <p className="text-sm font-semibold">Google</p>
            <div className="mt-1">
              {hasAuthenticator('google') ? (
                <GoogleDisableButton onDisabled={onGoogleDisabled} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Sign in with Google to enable.
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <p className="text-sm font-semibold">Apple</p>
            <div className="mt-1">
              {hasAuthenticator('apple') ? (
                <AppleDisableButton onDisabled={onAppleDisabled} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Sign in with Apple to enable.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base leading-none font-semibold tracking-tight">
              Sessions
            </h2>
            <p className="text-muted-foreground text-sm">
              Devices currently signed in to your account.
            </p>
          </div>
          <Sessions />
        </div>
      </div>
    </div>
  );
}
