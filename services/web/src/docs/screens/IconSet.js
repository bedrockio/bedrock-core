import React, { useEffect, useMemo, useState } from 'react';
import { memoize, throttle } from 'lodash';
import { Icon, Input, Divider } from 'semantic';

import { useClass } from 'helpers/bem';

import { copyToClipboard } from 'utils/copy';

import { ICON_MATCHES } from './const';

import './icon-set.less';

export default function IconSet(props) {
  const { url, type } = props;

  const [ids, setIds] = useState([]);
  const [copied, setCopied] = useState();

  const { className, getElementClass } = useClass('icon-set');

  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(null);

  useEffect(() => {
    loadSet();
  }, [url]);

  const deferredFilter = useMemo(() => {
    return throttle(filterIcons, 200);
  }, [ids]);

  useEffect(() => {
    deferredFilter(query);
  }, [url, query]);

  function filterIcons(q) {
    let filtered;
    if (q) {
      filtered = ids.filter((id) => {
        if (q) {
          return id.includes(q) || matchTags(q, id);
        } else {
          return true;
        }
      });
    } else {
      filtered = null;
    }
    setFiltered(filtered);
  }

  async function loadSet() {
    setIds([]);
    setFiltered([]);
    const ids = await loadIconSet(url);
    setIds(ids);
    setFiltered(ids);
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
        {(filtered || ids).map((id) => {
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

function matchTags(query, id) {
  const match = ICON_MATCHES.find((match) => {
    return match.tags.some((tag) => {
      return tag.includes(query);
    });
  });
  if (!match) {
    return false;
  }
  return id.includes(match.match);
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
