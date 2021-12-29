import React from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default class CodeBlock extends React.Component {
  render() {
    const { language, children } = this.props;
    return (
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        showLineNumbers
        wrapLines>
        {children}
      </SyntaxHighlighter>
    );
  }
}
