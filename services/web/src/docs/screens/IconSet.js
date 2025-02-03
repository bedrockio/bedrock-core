import React, { useEffect, useMemo, useState } from 'react';
import { memoize } from 'lodash';

import { Icon, Input, Divider } from 'semantic';

import { useClass } from 'helpers/bem';

import './icon-set.less';

export default function IconSet(props) {
  const { url, type } = props;

  const [ids, setIds] = useState([]);
  const [copied, setCopied] = useState();

  const { className, getElementClass } = useClass('icon-set');

  const [query, setQuery] = useState('');

  useEffect(() => {
    loadSet();
  }, [url, query]);

  const filtered = useMemo(() => {
    return ids.filter((id) => {
      if (query) {
        return id.includes(query);
      } else {
        return true;
      }
    });
  }, [query, ids]);

  async function loadSet() {
    setIds([]);
    const ids = await loadIconSet(url);
    setIds(ids);
  }

  function onSearchChange(evt, { value }) {
    setQuery(value);
  }

  async function flashCopied(id) {
    setCopied(id);
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    setCopied(null);
  }

  return (
    <React.Fragment>
      <Input fluid label="Search" value={query} onChange={onSearchChange} />
      <Divider hidden />
      <ul className={className}>
        {filtered.map((id) => {
          const isCopied = id === copied;
          return (
            <li
              key={id}
              onClick={() => {
                flashCopied(id);
                copyToClipboard(id);
              }}>
              {isCopied && <div className={getElementClass('copied')}>👍</div>}
              <div className={getElementClass('icon')}>
                <Icon name={`${id} ${type}`} />
              </div>
              <div className={getElementClass('name')}>{id}</div>
            </li>
          );
        })}
      </ul>
    </React.Fragment>
  );
}

const loadIconSet = memoize(async (url) => {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const symbols = doc.querySelectorAll('symbol');
  const ids = Array.from(symbols)
    .map((symbol) => {
      return symbol.id;
    })
    .filter((id) => {
      return id.length !== 1;
    })
    .toSorted((a, b) => {
      return a.localeCompare(b);
    });
  return ids;
});

// Needed for insecure contexts as often this page
// is most useful on local dev.
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // Use Clipboard API
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-HTTPS
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Prevent scrolling
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      alert('Copy failed');
    }
    document.body.removeChild(textarea);
    return Promise.resolve();
  }
}

copyToClipboard('Hello, local dev!');
