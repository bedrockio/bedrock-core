import { useState } from 'react';
import PropTypes from 'prop-types';
import { ActionIcon, Paper } from '@mantine/core';

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import theme from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';

import { useClass } from 'helpers/bem';

import { copyToClipboard } from 'utils/copy';

theme['pre[class*="language-"]'].lineHeight = '1';
theme['pre[class*="language-"]'].margin = '0';
theme['code[class*="language-"]'].fontSize = '14px';
theme['code[class*="language-"]'].lineHeight = '1';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('swift', swift);

import './code.less';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export default function Code({ scroll, action, ...rest }) {
  const [copied, setCopied] = useState();

  const { className, getElementClass } = useClass(
    'code',
    scroll ? 'scroll' : null,
  );

  async function onCopyClick() {
    copyToClipboard(rest.children);
    setCopied(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    setCopied(false);
  }

  return (
    <Paper className={className}>
      <SyntaxHighlighter style={theme} {...rest} />
      <div className={getElementClass('action')}>
        {action || (
          <div
            onClick={onCopyClick}
            className={getElementClass(
              'copy-button',
              copied ? null : 'clickable',
            )}>
            <ActionIcon variant="default">
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </ActionIcon>
          </div>
        )}
      </div>
    </Paper>
  );
}

Code.propTypes = {
  scroll: PropTypes.bool,
  action: PropTypes.node,
  children: PropTypes.string.isRequired,
};
