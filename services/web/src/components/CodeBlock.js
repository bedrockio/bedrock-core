import React from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PropTypes from 'prop-types';

atomDark['pre[class*="language-"]'].marginBottom = '1em';

export default class CodeBlock extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    language: PropTypes.string,
  };

  render() {
    const { language, value } = this.props;

    return (
      <SyntaxHighlighter
        language={language || 'bash'}
        style={atomDark}
        wrapLines>
        {value}
      </SyntaxHighlighter>
    );
  }
}
