import { Alert, Group, Loader, Paper, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';

import { request } from 'utils/api';

import Menu from './Menu';
import SendTestButton from './SendPreviewButton';

export default function Preview() {
  const { template } = usePage();

  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreview();
  }, []);

  async function loadPreview() {
    try {
      setError(null);
      setLoading(true);
      const { data } = await request({
        method: 'GET',
        path: `/1/templates/${template.id}/preview`,
      });

      setPreview(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function onTestSent() {
    setMessage('Test message sent!');
  }

  return (
    <>
      <Menu />
      <Stack mt="md" spacing="md">
        <ErrorMessage error={error} />
        {message && <Alert color="green">{message}</Alert>}
        <Paper withBorder style={{ position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 1,
              }}>
              <Loader />
            </div>
          )}
          <iframe
            srcDoc={preview?.html}
            style={{ width: '100%', height: '500px', border: 'none' }}
          />
        </Paper>
        <Group justify="flex-end">
          <SendTestButton
            channel="email"
            template={template}
            onSent={onTestSent}
          />
        </Group>
      </Stack>
    </>
  );
}
