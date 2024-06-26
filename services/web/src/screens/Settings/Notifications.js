import React from 'react';
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

import { withSession } from 'stores';

import screen from 'helpers/screen';

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

@screen
@withSession
export default class Notifications extends React.Component {
  state = {
    message: null,
    configs: this.context.user.notifications,
  };

  updateConfig = (newConfig) => {
    const configs = [...this.state.configs];

    const index = configs.findIndex((config) => {
      return config.type === newConfig.type;
    });
    if (index === -1) {
      configs.push(newConfig);
    } else {
      configs[index] = {
        ...configs[index],
        ...newConfig,
      };
    }

    this.setState({
      configs,
    });
  };

  onSubmit = async () => {
    try {
      this.setState({
        message: null,
        loading: true,
        error: null,
      });
      const { configs } = this.state;
      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/me`,
        body: {
          notifications: configs,
        },
      });
      this.context.updateUser(data);
      this.setState({
        error: false,
        loading: false,
        message: 'Settings Updated',
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading, message } = this.state;
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
            {this.renderSettings()}
          </Segment>
          <div style={{ textAlign: 'right' }}>
            <Button
              primary
              content="Save"
              loading={loading}
              disabled={loading}
              onClick={this.onSubmit}
            />
          </div>
        </Form>
      </React.Fragment>
    );
  }

  renderSettings() {
    const { user, meta } = this.context;
    if (!user || !meta) {
      return;
    }
    const { configs } = this.state;
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
                    <React.Fragment key={name}>
                      <Label
                        circular
                        color={isActive ? 'blue' : null}
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          this.updateConfig({
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
}
