import { useState } from 'react';
import PropTypes from 'prop-types';
import { ActionIcon } from '@mantine/core';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import theme from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';

import { useClass } from 'helpers/bem';

import { copyToClipboard } from 'utils/copy';

theme['pre[class*="language-"]'].margin = '0';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('swift', swift);

import './code.less';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export default function Code(props) {
  const { scroll, action } = props;

  const [copied, setCopied] = useState();

  const { className, getElementClass } = useClass(
    'code',
    scroll ? 'scroll' : null,
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
        <SyntaxHighlighter style={theme} {...rest} />
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
        <ActionIcon variant="outlined">
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        </ActionIcon>
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
