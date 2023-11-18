import React from 'react';
import { Segment, Form, Button, Divider, Header } from 'semantic';

import { withTheme } from 'stores';

import screen from 'helpers/screen';

import ErrorMessage from 'components/ErrorMessage';

import { Layout } from 'components';

import { request } from 'utils/api';

import { APP_NAME } from 'utils/env';


import Menu from './Menu';

@screen
@withTheme
export default class Account extends React.Component {
  state = {
    theme: this.context.theme,
  };

  async save() {
    try {
      this.setState({
        loading: true,
        error: null,
      });
      await request({
        method: 'PATCH',
        path: `/1/users/me`,
        body: {
          theme: this.state.theme,
        },
      });
      this.context.setTheme(this.state.theme, true);
      this.setState({
        error: false,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  setTheme(theme) {
    this.setState({ theme });
    this.context.setTheme(theme);
  }

  render() {
    const { error, loading, theme } = this.state;

    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <ErrorMessage error={error} />
        <Header>Appearance</Header>
        <p>
          Choose how {APP_NAME} looks to you. Select a light or dark mode, or
          sync with your system and automatically switch between light and dark
          mode.
        </p>
        <Form onSubmit={() => this.save()}>
          <Header as="h5">
            <Form.Checkbox
              checked={theme === 'system'}
              onChange={(e, { checked }) =>
                this.setTheme(checked ? 'system' : undefined)
              }
              label="Sync With System"
            />
          </Header>

          <p style={{ marginLeft: '1.92em', marginTop: '-0.8em' }}>
            Sync with OS setting Automatically switch between light and dark
            themes when your system does.
          </p>

          <Divider hidden />

          <div className="diurnal-theme" style={{paddingBottom: '1em'}}>
            <Segment>
              <Layout horizontal baseline>
                <Form.Radio
                  disabled={theme === 'system'}
                  checked={theme === 'light'}
                  label="Light Mode"
                  onClick={() => this.setTheme('light')}
                />
              </Layout>
            </Segment>
          </div>

          <div className="nocturnal-theme">
            <Segment>
              <Layout horizontal baseline>
                <Form.Radio
                  disabled={theme === 'system'}
                  checked={theme === 'dark'}
                  label="Dark Mode"
                  onClick={() => this.setTheme('dark')}
                />
              </Layout>
            </Segment>
          </div>

          <Divider hidden />
          <div>
            <Button
              primary
              content="Save"
              loading={loading}
              disabled={loading}
            />
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
