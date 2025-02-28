import React, { useState } from 'react';
import {
  Segment,
  Label,
  Dimmer,
  Loader,
  Form,
  Button,
  Divider,
  Message,
} from 'semantic';

import { useSession } from 'stores/session';

import ErrorMessage from 'components/ErrorMessage';

import { request } from 'utils/api';

import Menu from './Menu';

const CHANNELS = [
  {
    label: 'SMS',
    value: 'sms',
  },
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Push',
    value: 'push',
  },
];

export default function Notifications() {
  const { user, meta, updateUser } = useSession();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [configs, setConfigs] = useState(() => {
    return meta.notifications.map((base) => {
      const config = user.notifications.find((c) => {
        return c.name === base.name;
      });
      return {
        ...base,
        ...config,
      };
    });
  });

  function updateConfig(newConfig) {
    const newConfigs = [...configs];

    const index = newConfigs.findIndex((config) => {
      return config.type === newConfig.type;
    });
    if (index === -1) {
      newConfigs.push(newConfig);
    } else {
      newConfigs[index] = {
        ...newConfigs[index],
        ...newConfig,
      };
    }

    setConfigs(newConfigs);
  }

  async function onSubmit() {
    try {
      setMessage(null);
      setLoading(true);
      setError(null);
      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/me`,
        body: {
          notifications: configs,
        },
      });

      updateUser(data);

      setMessage('Settings Updated');
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <ErrorMessage error={error} />
        <Form>
          {message && <Message success>{message}</Message>}
          <Segment>
            {loading && (
              <Dimmer inverted active>
                <Loader />
              </Dimmer>
            )}
            {renderSettings()}
          </Segment>
          <div style={{ textAlign: 'right' }}>
            <Button
              primary
              content="Save"
              loading={loading}
              disabled={loading}
              onClick={onSubmit}
            />
          </div>
        </Form>
      </React.Fragment>
    );
  }

  function renderSettings() {
    if (!user || !meta) {
      return;
    }
    const { notifications } = meta;
    if (!notifications.length) {
      return <div>No notification settings.</div>;
    }
    return (
      <React.Fragment>
        {notifications.map((notification) => {
          const { name, label } = notification;
          const config = configs.find((c) => {
            return c.name === name;
          });
          return (
            <Form.Field key={name}>
              <label>{label}</label>
              <div
                style={{
                  margin: '1em 0 0.5em',
                  display: 'flex',
                  gap: '6px',
                }}>
                {CHANNELS.map((channel) => {
                  const { value, label } = channel;
                  const isActive = config?.[value] || false;
                  return (
                    <React.Fragment key={name + value}>
                      <Label
                        circular
                        color={isActive ? 'blue' : null}
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          updateConfig({
                            ...config,
                            name,
                            [value]: !isActive,
                          });
                        }}>
                        <span
                          style={{
                            padding: '0 0.3em',
                          }}>
                          {label}
                        </span>
                      </Label>
                    </React.Fragment>
                  );
                })}
              </div>
            </Form.Field>
          );
        })}
      </React.Fragment>
    );
  }

  return render();
}
