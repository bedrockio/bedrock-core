import React from 'react';
import PropTypes from 'prop-types';
import { Header, Dropdown } from 'semantic';
import { Layout } from 'components/Layout';
import CodeBlock from '../CodeBlock';
import templateCurl from './templates/curl';
import templateFetch from './templates/fetch';
import templateSwift from './templates/swift';
import { API_URL } from 'utils/env';

const OPTIONS = [
  {
    template: templateCurl,
    value: 'curl',
    text: 'cURL',
    language: 'bash',
  },
  {
    template: templateFetch,
    value: 'fetch',
    text: 'Fetch',
    language: 'js',
  },

  {
    template: templateSwift,
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
    header: true,
    template: 'curl',
  };

  state = {
    current: this.props.template,
  };

  constructor(props) {
    super(props);
    this.templateRef = React.createRef();
  }

  getDefaultHeaders() {
    const { authToken, apiKey } = this.props;
    const headers = {
      'API-Key': `${apiKey || '<apiKey>'}`,
      ...this.props.headers,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
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
    const option = OPTIONS.find((c) => c.value === this.state.current);
    const { method, path } = this.props.request;

    return (
      <>
        {this.props.header && (
          <Layout horizontal spread center>
            <Header style={{ margin: 0 }}>
              {method} {path}
            </Header>
            <Layout.Group>
              <Dropdown
                onChange={(e, { value }) => {
                  this.setState({ current: value });
                }}
                selection
                options={OPTIONS.map(({ value, text }) => {
                  return {
                    value,
                    text,
                  };
                })}
                value={this.state.current}
              />
            </Layout.Group>
          </Layout>
        )}
        <CodeBlock
          height={this.props.height}
          language={option.language}
          value={option.template(this.getData())}></CodeBlock>
      </>
    );
  }
}
