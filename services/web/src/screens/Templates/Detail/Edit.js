import React, { useState } from 'react';
import {
  Form,
  Dimmer,
  Loader,
  Segment,
  Message,
  Button,
  ButtonGroup,
} from 'semantic';

import { usePage } from 'stores/page';

import ErrorMessage from 'components/ErrorMessage';

import Layout from 'components/Layout';

import { request } from 'utils/api';

import Menu from './Menu';
import HelpModal from './HelpModal';
import SendTestButton from './SendPreviewButton';

export default function TemplateEdit() {
  const { template, update } = usePage();

  const [fields, setFields] = useState(template);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState(template.channels[0]);

  async function onSubmit() {
    try {
      setError(null);
      setLoading(true);
      setMessage('');
      await request({
        method: 'PATCH',
        path: `/1/templates/${template.id}`,
        body: fields,
      });
      setLoading(false);
      setMessage('Saved template.');
      update({
        template: fields,
      });
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function onTestSent() {
    setMessage('Test message sent!');
  }

  function onBodyChange(evt, { value }) {
    setFields({
      ...fields,
      [channel]: value,
    });
  }

  function render() {
    return (
      <React.Fragment>
        <Menu />
        {renderSwitch()}
        {message && <Message success>{message}</Message>}
        <Segment>
          <Form
            noValidate
            id="edit-template-inline"
            error={!!error}
            onSubmit={onSubmit}>
            {loading && (
              <Dimmer inverted active>
                <Loader />
              </Dimmer>
            )}
            <ErrorMessage error={error} />
            <Form.TextArea
              required
              name="body"
              label="Body"
              value={fields[channel] || ''}
              onChange={onBodyChange}
              style={{
                fontSize: '14px',
                fontFamily: 'Menlo, Monaco, Courier, Courier New, monospace',
              }}
              rows={20}
            />
            <HelpModal
              size="small"
              trigger={
                <Button basic type="button" size="tiny" content="Help" />
              }
            />

            <Layout horizontal center right>
              <SendTestButton
                channel={channel}
                template={template}
                onSent={onTestSent}
              />
              <Button content="Save" />
            </Layout>
          </Form>
        </Segment>
      </React.Fragment>
    );
  }

  function renderSwitch() {
    return (
      <ButtonGroup basic>
        {renderSwitchButton('email', 'envelope regular')}
        {renderSwitchButton('sms', 'comment-dots regular')}
        {renderSwitchButton('push', 'mobile-screen')}
      </ButtonGroup>
    );
  }

  function renderSwitchButton(type, icon) {
    if (!template.channels.includes(type)) {
      return;
    }

    const active = channel === type;
    return (
      <Button
        icon={icon}
        active={active}
        onClick={() => {
          setChannel(type);
        }}
      />
    );
  }

  return render();
}
