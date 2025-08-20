import { useState } from 'react';

import { JWT_KEY, request } from 'utils/api';
import { Button, Alert } from '@mantine/core';

export default function LoginAsUser({ user, close }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const onConfigure = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await request({
        method: 'POST',
        path: `/1/users/${user.id}/authenticate`,
      });
      setToken(data.token);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const onStart = () => {
    const tab = window.open(`/`, '_blank');
    tab.sessionStorage.setItem(JWT_KEY, token);
    close();
  };

  const isReady = !!token;

  return (
    <>
      {error && (
        <Alert color="red" title="Error">
          {error.message}
        </Alert>
      )}

      {!isReady && (
        <>
          <p>
            Are you sure you want to log in as {user.email}? The session will be
            valid for 2 hours only.
          </p>
          <Button primary fullWidth loading={loading} onClick={onConfigure}>
            Authenticate
          </Button>
        </>
      )}

      {isReady && (
        <>
          <p style={{ textAlign: 'center' }}>
            Click below to start the session in a new tab. Only that tab will be
            authenticated as the user. Close the tab to end the session.
          </p>

          <Button
            variant={!token ? 'outline' : 'filled'}
            color={token ? 'primary' : 'gray'}
            fullWidth
            onClick={onStart}>
            Open window
          </Button>
        </>
      )}
      <br />
    </>
  );
}
