import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';

import bem from 'helpers/bem';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('swift', swift);

// atomDark['pre[class*="language-"]'].marginBottom = '1em';

import './code.less';

@bem
export default class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
  }

  getModifiers() {
    const { scroll } = this.props;
    return [scroll ? 'scroll' : null];
  }

  onCopyClick = async () => {
    navigator.clipboard.writeText(this.props.children);
    this.setState({
      copied: true,
    });
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    this.setState({
      copied: false,
    });
  };

  render() {
    const { copy, scroll, ...rest } = this.props;
    return (
      <div className={this.getBlockClass()}>
        <SyntaxHighlighter style={atomDark} {...rest} />
        {this.renderCopyButton()}
      </div>
    );
  }

  renderCopyButton() {
    const { copied } = this.state;
    return (
      <div
        onClick={this.onCopyClick}
        className={this.getElementClass(
          'copy-button',
          copied ? null : 'clickable'
        )}>
        <Icon name={copied ? 'check' : 'copy'} fitted />
      </div>
    );
  }
}

Code.propTypes = {
  scroll: PropTypes.bool,
  children: PropTypes.string.isRequired,
};
