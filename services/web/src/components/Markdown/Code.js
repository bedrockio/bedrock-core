import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('swift', swift);

atomDark['pre[class*="language-"]'].marginBottom = '1em';

import './code.less';

class CodeBlock extends PureComponent {
  static propTypes = {
    source: PropTypes.string,
    language: PropTypes.string,
  };

  static defaultProps = {
    language: null,
  };

  getSource() {
    const { source, children } = this.props;
    if (source) {
      return source;
    } else {
      return children[0]?.trim() || '';
    }
  }

  getLanguage() {
    const { language, className = '' } = this.props;
    if (language) {
      return language;
    } else {
      return className.match(/^language-(\w+)$/)?.[1] || 'bash';
    }
  }
  onCopyClick = () => {
    navigator.clipboard.writeText(this.props.value);
  };

  render() {
    const { inline, value, children, allowCopy } = this.props;
    if (inline) {
      return <code>{value || children}</code>;
    } else if (allowCopy) {
      return this.renderWithCopy();
    } else {
      return this.renderCode();
    }
  }

  renderCode() {
    const language = this.getLanguage();
    const source = this.getSource();
    return (
      <SyntaxHighlighter language={language} style={atomDark}>
        {source}
      </SyntaxHighlighter>
    );
  }

  renderWithCopy() {
    return (
      <div className="code-copy-container">
        <div className="code-copy-button">
          <Button basic inverted icon="copy" onClick={this.onCopyClick} />
        </div>
        {this.renderCode()}
      </div>
    );
  }
}

export default CodeBlock;
