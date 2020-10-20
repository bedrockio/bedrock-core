import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import Heading from './Heading';
import 'github-markdown-css';
import { enrichMarkdown, executeOpenApiMacros } from 'utils/markdown';

export default class StandardPage extends React.Component {
  render() {
    const { credentials, page, openApi } = this.props;
    let markdown = enrichMarkdown(page.markdown, credentials);
    markdown = executeOpenApiMacros(openApi, markdown);
    return (
      <div className="docs markdown-body">
        <ReactMarkdown
          source={markdown}
          renderers={{
            code: CodeBlock,
            heading: Heading,
          }}
        />
      </div>
    );
  }

}
