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
      file: PropTypes.bool,
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

  getData() {
    const { baseUrl, authToken, request } = this.props;
    const { path, ...rest } = request;
    return {
      ...rest,
      url: baseUrl ? `${baseUrl}${path}` : path,
      ...(authToken
        ? {
            headers: {
              ...rest.headers,
              ...(request?.body && !request?.file
                ? { 'Content-Type': 'application/json' }
                : {}),
              Authorization: `Bearer ${authToken}`,
            },
          }
        : {}),
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
                options={OPTIONS}
                value={this.state.current}
              />
            </Layout.Group>
          </Layout>
        )}
        <CodeBlock
          language={option.language}
          value={option.template(this.getData())}></CodeBlock>
      </>
    );
  }
}
