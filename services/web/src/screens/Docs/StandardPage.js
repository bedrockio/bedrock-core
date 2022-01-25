import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import CodeBlock from 'components/CodeBlock';
import RequestBlock from 'components/RequestBlock';
import Heading from './Heading';
import 'github-markdown-css';
import { enrichMarkdown, executeOpenApiMacros } from 'utils/markdown';

import './table.less';
import { API_URL } from 'utils/env';

export default class StandardPage extends React.Component {
  renderCodeBlock = (props) => {
    if (props.language && props.language.includes('request')) {
      return (
        <RequestBlock
          authToken={'<token>'}
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
      <div className="docs markdown-body">
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
