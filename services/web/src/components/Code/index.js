import { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';

import { useClass } from 'helpers/bem';

import { copyToClipboard } from 'utils/copy';

atomDark['pre[class*="language-"]'].margin = '0';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('swift', swift);

import './code.less';

export default function Code(props) {
  const { scroll, action } = props;

  const [copied, setCopied] = useState();

  const { className, getElementClass } = useClass(
    'code',
    scroll ? 'scroll' : null
  );

  async function onCopyClick() {
    copyToClipboard(props.children);
    setCopied(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    setCopied(false);
  }

  function render() {
    const { copy, scroll, ...rest } = props;
    return (
      <div className={className}>
        <SyntaxHighlighter style={atomDark} {...rest} />
        {renderAction()}
      </div>
    );
  }

  function renderAction() {
    return (
      <div className={getElementClass('action')}>
        {action || renderCopyButton()}
      </div>
    );
  }

  function renderCopyButton() {
    return (
      <div
        onClick={onCopyClick}
        className={getElementClass('copy-button', copied ? null : 'clickable')}>
        <Icon name={copied ? 'check' : 'copy'} fitted />
      </div>
    );
  }

  return render();
}

Code.propTypes = {
  scroll: PropTypes.bool,
  action: PropTypes.node,
  children: PropTypes.string.isRequired,
};
