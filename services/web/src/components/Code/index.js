import { Paper } from '@mantine/core';
import { Highlight, themes } from 'prism-react-renderer';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { PiCheckFatFill, PiCopyFill } from 'react-icons/pi';

import { useClass } from 'helpers/bem';

import { copyToClipboard } from 'utils/copy';

import './code.less';

function CodeBlock({ code, language }) {
  if (!code) return null;

  return (
    <div
      style={{
        margin: 0,
        fontSize: '1em',
      }}>
      <Highlight code={code.trim()} language={language} theme={themes.vsDark}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              lineHeight: 1.2,
              padding: '1em 0.5em',
              margin: 0,
            }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export default function Code({ code, language, scroll, action, ...rest }) {
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

  const lang = useMemo(() => {
    if (language === 'bash') {
      return 'python';
    }
    return language || 'json';
  }, [language]);

  return (
    <Paper className={className}>
      <CodeBlock code={code || rest.children} language={lang} />
      <div className={getElementClass('action')}>
        {action || (
          <div
            onClick={onCopyClick}
            className={getElementClass(
              'copy-button',
              copied ? null : 'clickable',
            )}>
            {copied ? <PiCheckFatFill /> : <PiCopyFill />}
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
