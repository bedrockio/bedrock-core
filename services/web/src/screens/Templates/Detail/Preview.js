import { useEffect, useState } from 'react';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

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
      <div className="mt-4 flex flex-col gap-4">
        <ErrorMessage error={error} />
        {message && (
          <Alert variant="success">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <Card className="relative overflow-hidden p-0">
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
              <Spinner />
            </div>
          )}
          <iframe
            srcDoc={preview?.html}
            style={{ width: '100%', height: '500px', border: 'none' }}
          />
        </Card>
        <div className="flex justify-end">
          <SendTestButton
            channel="email"
            template={template}
            onSent={onTestSent}
          />
        </div>
      </div>
    </>
  );
}
