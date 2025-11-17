import { useQuery } from '@bedrockio/router';
import { Alert, Group, LoadingOverlay, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';

import ErrorMessage from 'components/ErrorMessage';
import Logo from 'components/Logo';
import Meta from 'components/Meta';

import { request } from 'utils/api';

export default function Unsubscribe() {
  const { token } = useQuery();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      load();
    } else {
      setError(new Error('Could not find a valid token.'));
    }
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      await request({
        method: 'POST',
        path: '/1/unsubscribe',
        token,
      });

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  function render() {
    return (
      <Group justify="center" align="center" pt={{ base: 30, sm: 120 }}>
        {loading && <LoadingOverlay visible />}
        <Stack w={{ base: '95vw', sm: 480 }} align="center">
          <Meta title="Unsubscribe" />
          <Logo maw={200} title="Unsubscribe" />
          <ErrorMessage error={error} />
          {success && (
            <Alert title="Success">You have been unsubscribed.</Alert>
          )}
        </Stack>
      </Group>
    );
  }

  return render();
}
