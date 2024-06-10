import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Header } from 'semantic';

import Layout from 'components/Layout';
import Code from 'components/Code';

import { API_URL } from 'utils/env';

import templateCurl from './templates/curl';
import templateFetch from './templates/fetch';
import templateSwift from './templates/swift';

const TEMPLATES = {
  curl: templateCurl,
  fetch: templateFetch,
  swift: templateSwift,
};

const OPTIONS = [
  {
    value: 'curl',
    text: 'cURL',
    language: 'bash',
  },
  {
    value: 'fetch',
    text: 'Fetch',
    language: 'js',
  },

  {
    value: 'swift',
    text: 'Swift',
    language: 'swift',
  },
];

export default class RequestBlock extends React.Component {
  static propTypes = {
    height: PropTypes.string,
    apiKey: PropTypes.string,
    authToken: PropTypes.string,
    baseUrl: PropTypes.string,
    header: PropTypes.bool,
    template: PropTypes.string,
    request: PropTypes.shape({
      path: PropTypes.string.isRequired,
      method: PropTypes.oneOf(['POST', 'GET', 'PATCH', 'DELETE', 'PUT'])
        .isRequired,
      body: PropTypes.object,
      headers: PropTypes.object,
    }).isRequired,
  };

  static defaultProps = {
    baseUrl: API_URL,
    template: 'curl',
    header: false,
    selector: true,
  };

  state = {
    current: this.props.template,
  };

  getDefaultHeaders() {
    const { authToken, apiKey, request } = this.props;
    const headers = {
      'API-Key': `${apiKey || '<apiKey>'}`,
      ...this.props.headers,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (request?.body && !request?.file) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  getData() {
    const { baseUrl, request } = this.props;
    const { path, ...rest } = request;
    return {
      ...rest,
      url: baseUrl ? `${baseUrl}${path}` : path,
      headers: this.getDefaultHeaders(),
    };
  }

  render() {
    const { header, selector } = this.props;
    const { current } = this.state;
    const option = OPTIONS.find((c) => c.value === this.state.current);
    const { method, path } = this.props.request;

    const template = TEMPLATES[current];

    return (
      <React.Fragment>
        {(header || selector) && (
          <Layout horizontal spread center>
            <Layout.Group>
              {header && (
                <Header style={{ margin: 0 }}>
                  {method} {path}
                </Header>
              )}
            </Layout.Group>
            <Layout.Group>
              {selector && (
                <React.Fragment>
                  <Dropdown
                    onChange={(e, { value }) => {
                      this.setState({ current: value });
                    }}
                    selection
                    options={OPTIONS}
                    value={this.state.current}
                    style={{
                      marginBottom: '0.5em',
                    }}
                  />
                </React.Fragment>
              )}
            </Layout.Group>
          </Layout>
        )}
        <Code language={option.language}>{template(this.getData())}</Code>
      </React.Fragment>
    );
  }
}
