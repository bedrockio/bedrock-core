import React from 'react';
import RequestBlock from 'screens/Docs/RequestBlock';
import Markdown from 'components/Markdown';
import Code from 'components/Markdown/Code';
import Heading from './Heading';
import 'github-markdown-css';
import { enrichMarkdown, executeOpenApiMacros } from 'utils/markdown';

import './table.less';
import { API_URL } from 'utils/env';

export default class StandardPage extends React.Component {
  renderCodeBlock = (props) => {
    const { className = '', children } = props;
    if (className.includes('request')) {
      const value = Array.isArray(children) ? children[0] : children;
      return (
        <RequestBlock
          authToken={'<token>'}
          request={JSON.parse(value)}
          baseUrl={API_URL}
        />
      );
    }

    return <Code {...props} allowCopy />;
  };

  render() {
    const { credentials, page, openApi } = this.props;
    let markdown = enrichMarkdown(page.markdown, credentials);
    markdown = executeOpenApiMacros(openApi, markdown);

    return (
      <div className="docs markdown-body">
        <Markdown
          source={markdown}
          components={{
            code: this.renderCodeBlock,
            heading: Heading,
          }}
        />
      </div>
    );
  }
}
