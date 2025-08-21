import React, { useState, useEffect } from 'react';
import { Divider, Segment, Message, Dimmer, Loader } from 'semantic';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';
import Layout from 'components/Layout';

import { request } from 'utils/api';

import Menu from './Menu';
import SendTestButton from './SendPreviewButton';

export default function TemplateEdit() {
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
    <React.Fragment>
      <Menu />
      <Divider hidden />
      <ErrorMessage error={error} />
      {message && <Message success>{message}</Message>}
      <Segment>
        {loading && (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        )}
        <iframe
          srcDoc={preview?.html}
          style={{ width: '100%', height: '500px' }}
          frameBorder="0"
        />
      </Segment>
      <Layout horizontal right>
        <SendTestButton
          channel="email"
          template={template}
          onSent={onTestSent}
        />
      </Layout>
    </React.Fragment>
  );
}
