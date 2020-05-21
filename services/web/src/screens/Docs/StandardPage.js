import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import 'github-markdown-css';
import { enrichMarkdown, executeOpenApiMacros } from 'utils/markdown';

export default class StandardPage extends React.Component {
  render() {
    const { credentials, me, page, openApi } = this.props;
    let markdown = enrichMarkdown(page.markdown, me, credentials);
    markdown = executeOpenApiMacros(openApi, markdown);
    return (
      <div className="docs markdown-body">
        <ReactMarkdown source={markdown} renderers={{ code: CodeBlock }} />
      </div>
    );
  }
}
