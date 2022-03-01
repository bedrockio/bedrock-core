import React from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from 'semantic';
import PropTypes from 'prop-types';

atomDark['pre[class*="language-"]'].marginBottom = '1em';

export default class CodeBlock extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    language: PropTypes.string,
  };

  state = {
    hover: false,
  };

  onCopyClick = () => {
    navigator.clipboard.writeText(this.props.value);
  };

  render() {
    const { language, value } = this.props;
    return (
      <div
        style={{ position: 'relative' }}
        onMouseLeave={() => {
          this.setState({ hover: false });
        }}
        onMouseEnter={() => this.setState({ hover: true })}>
        {this.state.hover && (
          <Button
            basic
            inverted
            style={{ position: 'absolute', right: 0, top: '7px' }}
            icon={'copy'}
            onClick={this.onCopyClick}
          />
        )}
        <SyntaxHighlighter
          language={language || 'bash'}
          style={atomDark}
          wrapLines>
          {value}
        </SyntaxHighlighter>
      </div>
    );
  }
}
