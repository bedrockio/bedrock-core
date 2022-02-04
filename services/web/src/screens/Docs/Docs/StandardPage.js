import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import CodeBlock from 'screens/Docs/CodeBlock';
import RequestBlock from 'screens/Docs/RequestBlock';
import Heading from './Heading';
import 'github-markdown-css';
import { enrichMarkdown, executeOpenApiMacros } from 'utils/markdown';

import './table.less';
import { API_URL } from 'utils/env';
import { Context } from '../Context';

export default class StandardPage extends React.Component {
  static contextType = Context;

  state = {
    application: undefined,
  };

  renderCodeBlock = (props) => {
    if (props.language && props.language.includes('request')) {
      return (
        <RequestBlock
          authToken={'<token>'}
          apiKey={this.context.application?.apiKey}
          request={JSON.parse(props.value)}
          baseUrl={API_URL}
        />
      );
    }

    return <CodeBlock {...props} />;
  };

  render() {
    const { credentials, page, openApi } = this.props;
    let markdown = enrichMarkdown(page.markdown, credentials);
    markdown = executeOpenApiMacros(openApi, markdown);

    return (
      <div className="docs markdown-body" style={{ position: 'relative' }}>
        <ReactMarkdown
          allowDangerousHtml
          source={markdown}
          plugins={[gfm]}
          renderers={{
            code: this.renderCodeBlock,
            heading: Heading,
          }}
        />
      </div>
    );
  }
}
