import { Layout } from 'components';
import React from 'react';
import { Button, Header, Dropdown } from 'semantic';
import CodeBlock from '../CodeBlock';

// Careful with spacing
const templateCurl = ({ url, method, headers, body = {} }) =>
  `curl ${url}  -X ${method.toUpperCase()} \\\n${Object.keys(headers)
    .map((key) => `  -H '${key}: ${headers[key]}'`)
    .join(' \\\n')}${body ? `-d ${JSON.stringify(body)}` : ''}`;

const templateFetch = ({ url, ...rest }) =>
  `fetch("${url}", ${JSON.stringify(rest, null, 2)});`;

const options = [
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
];

export default class FetchBlock extends React.Component {
  state = {
    current: 'curl',
  };

  constructor(props) {
    super(props);
    this.templateRef = React.createRef();
  }

  getData() {
    return {
      headers: {
        Client: 'web',
        'Content-Type': 'application/json',
      },
      url: 'http://google.com',
      body: undefined,
      method: 'GET',
    };
  }

  handleOnCopy = () => {
    const option = options.find((c) => c.value === this.state.current);
    navigator.clipboard.writeText(option.template(this.getData()));
  };

  render() {
    const option = options.find((c) => c.value === this.state.current);
    return (
      <>
        <Layout horizontal spread center>
          <Header style={{ margin: 0 }}>{this.props.title}</Header>
          <Layout.Group>
            <Dropdown
              onChange={(e, { value }) => {
                this.setState({ current: value });
              }}
              options={options}
              value={this.state.current}
            />{' '}
            <Button size="small" circular onClick={this.handleCopy}>
              Copy
            </Button>
          </Layout.Group>
        </Layout>
        <CodeBlock language={option.language}>
          {option.template(this.getData())}
        </CodeBlock>
      </>
    );
  }
}
