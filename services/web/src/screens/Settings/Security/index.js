import { useState } from 'react';
import { PiTrashBold } from 'react-icons/pi';

import { useSession } from 'stores/session';

import AppleDisableButton from 'components/Auth/Apple/DisableButton';
import GoogleDisableButton from 'components/Auth/Google/DisableButton';
import ErrorMessage from 'components/ErrorMessage';
import Meta from 'components/Meta';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

import { createPasskey, removePasskey } from 'utils/auth/passkey';
import { formatDate, fromNow } from 'utils/date';

import Menu from '../Menu';
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

  return (
    <div className="flex flex-col gap-4">
      <Meta title="Security" />
      <Menu />
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Spinner className="size-6" />
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Passkey</legend>
              <div className="flex flex-col gap-2">
                {user.authenticators
                  .filter((authenticator) => authenticator.type === 'passkey')
                  .map((passkey) => {
                    const { id, name, createdAt, lastUsedAt } = passkey;
                    return (
                      <div
                        className="flex items-center justify-between"
                        key={id}>
                        <div className="flex flex-col gap-0">
                          <span className="text-sm">{name}</span>
                          <span className="text-sm">
                            Added on {formatDate(createdAt)} | Last used{' '}
                            {fromNow(lastUsedAt)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          disabled={loading}
                          onClick={() => deletePasskey(passkey)}>
                          <PiTrashBold />
                        </Button>
                      </div>
                    );
                  })}
                <div className="flex">
                  <Button variant="outline" onClick={onCreatePasskeyClick}>
                    Add Passkey
                  </Button>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Two-factor authentication
              </legend>
              <TwoFactorAuthentication />
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Sign-in with</legend>
              <ErrorMessage error={error} />

              <p className="text-sm font-bold">Google</p>
              <div>
                {hasAuthenticator('google') ? (
                  <GoogleDisableButton onDisabled={onGoogleDisabled} />
                ) : (
                  <p className="text-sm">Sign in with Google to enable.</p>
                )}
              </div>

              <Separator className="my-4" />

              <p className="text-sm font-bold">Apple</p>
              <div>
                {hasAuthenticator('apple') ? (
                  <AppleDisableButton onDisabled={onAppleDisabled} />
                ) : (
                  <p className="text-sm">Sign in with Apple to enable.</p>
                )}
              </div>
            </fieldset>
          </div>
          <div>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium">Sessions</legend>
              <Sessions />
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
