import React from 'react';
import { Segment, Form, Divider, Header } from 'semantic';

import { useTheme } from 'stores/theme';

import Layout from 'components/Layout';

import Menu from './Menu';
import Meta from 'components/Meta';

export default function Appearance() {
  const { theme, setTheme } = useTheme();
  return (
    <React.Fragment>
      <Meta title="Appearance" />
      <Menu />
      <Divider hidden />
      <Segment>
        <Header as="h5">Choose the theme for this device</Header>
        <Divider hidden />
        <Layout vertical>
          <Form.Radio
            checked={theme === 'light'}
            label="Light Mode"
            onClick={() => {
              setTheme('light');
            }}
          />
          <Form.Radio
            checked={theme === 'dark'}
            label="Dark Mode"
            onClick={() => {
              setTheme('dark');
            }}
          />
          <Form.Radio
            checked={theme === 'system'}
            label="Sync with System"
            onClick={() => {
              setTheme('system');
            }}
          />
        </Layout>

        <Divider hidden />
      </Segment>
    </React.Fragment>
  );
}
