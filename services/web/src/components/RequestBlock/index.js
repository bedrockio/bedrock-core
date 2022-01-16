import { Layout } from 'components';
import React from 'react';
import { Button, Header, Dropdown } from 'semantic';
import CodeBlock from '../CodeBlock';
import templateCurl from './templates/curl';
import templateFetch from './templates/fetch';

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
    return this.props.request;
  }

  onCopyClick = () => {
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
              selection
              options={options}
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
