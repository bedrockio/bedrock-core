import { useQuery } from '@bedrockio/router';
import { useEffect, useState } from 'react';

import ErrorMessage from 'components/ErrorMessage';
import Logo from 'components/Logo';
import Meta from 'components/Meta';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

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
      <div className="flex justify-center px-4 pt-8 sm:pt-30">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
            <Spinner className="size-6" />
          </div>
        )}
        <div className="flex w-[95vw] flex-col items-center sm:w-[480px]">
          <Meta title="Unsubscribe" />
          <Logo className="max-w-[200px]" title="Unsubscribe" />
          <ErrorMessage error={error} />
          {success && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>You have been unsubscribed.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  return render();
}
