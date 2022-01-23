import React from 'react';
import PropTypes from 'prop-types';
import { Button, Header, Dropdown } from 'semantic';
import { Layout } from '../Layout';
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
  };

  state = {
    current: 'curl',
  };

  constructor(props) {
    super(props);
    this.templateRef = React.createRef();
  }

  getData(expose) {
    const { baseUrl, authToken, request } = this.props;
    const { path, ...rest } = request;
    return {
      ...rest,
      url: baseUrl ? `${baseUrl}${path}` : path,
      ...(authToken
        ? {
            headers: {
              ...rest.headers,
              Authorization: `Bearer ${expose ? authToken : '<hidden>'}`,
            },
          }
        : {}),
    };
  }

  onCopyClick = () => {
    const option = OPTIONS.find((c) => c.value === this.state.current);
    navigator.clipboard.writeText(option.template(this.getData(true)));
  };

  render() {
    const option = OPTIONS.find((c) => c.value === this.state.current);
    return (
      <>
        <Layout horizontal spread center>
          <Header style={{ margin: 0 }}>{this.props.title}</Header>
          <Layout.Group>
            <Dropdown
              onChange={(e, { value }) => {
                this.setState({ current: value });
              }}
              selection
              options={OPTIONS}
              value={this.state.current}
            />{' '}
            <Button size="small" circular onClick={this.onCopyClick}>
              Copy
            </Button>
          </Layout.Group>
        </Layout>
        <CodeBlock
          language={option.language}
          value={option.template(this.getData())}></CodeBlock>
      </>
    );
  }
}
