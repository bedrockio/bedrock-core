import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import { Loader } from 'semantic';

import ErrorMessage from 'components/ErrorMessage';

import { request } from 'utils/api';

export default function Unsubscribe() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const token = params.get('token');
    const channel = params.get('channel');

    if (!type || !token || !channel) {
      history.push('/');
    }

    setError(null);
    setLoading(true);

    try {
      await request({
        method: 'POST',
        path: '/1/notifications/unsubscribe',
        body: {
          type,
          token,
          channel,
        },
      });
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader active />;
  }

  return (
    <div>
      <ErrorMessage error={error} />
      {success && (
        <h2 style={{ textAlign: 'center' }}>
          You have successfully unsubscribed.
        </h2>
      )}
    </div>
  );
}
