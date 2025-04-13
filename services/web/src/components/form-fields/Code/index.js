import { useRef, useEffect } from 'react';
import { Form } from 'semantic';

import { useClass } from 'helpers/bem';

import { onMount, onUnmount } from 'utils/hooks';

import './code.less';

const CHAR_REG = /^[a-z0-9]$/i;

export default function CodeField(props) {
  const { value, length, disabled, onChange, onComplete } = props;

  const { className, getElementClass } = useClass(
    'code-field',
    disabled ? 'disabled' : null,
  );

  const characters = Array.from(new Array(length), (el, i) => {
    return value.charAt(i);
  });

  useEffect(() => {
    if (value.length >= length) {
      onComplete();
    }
  }, [value]);

  function setCharacter(evt, index, val, move = true) {
    index = Number(index);
    const newValue = value.slice(0, index) + val + value.slice(index + 1);
    onChange(evt, { ...props, value: newValue });

    if (move && val) {
      focusNext(evt);
    } else if (move && !val) {
      focusPrev(evt);
    }
  }

  function onKeyDown(evt) {
    if (disabled) {
      evt.preventDefault();
      return;
    }
    const { index } = evt.target.dataset;
    if (evt.key === 'Backspace') {
      setCharacter(evt, index, '');
      evt.preventDefault();
    } else if (evt.key === 'Delete') {
      setCharacter(evt, index, '', false);
      evt.preventDefault();
    } else if (evt.key === 'ArrowLeft') {
      focusPrev(evt);
    } else if (evt.key === 'ArrowRight') {
      focusNext(evt);
    } else if (isInputKey(evt)) {
      setCharacter(evt, index, evt.key);
    }
  }

  function isInputKey(evt) {
    return !hasMetaKeys(evt) && isAllowedChar(evt.key);
  }

  function hasMetaKeys(evt) {
    return evt.metaKey || evt.altKey || evt.ctrlKey;
  }

  function isAllowedChar(key) {
    return CHAR_REG.test(key);
  }

  function handleOnPaste(evt) {
    if ('value' in evt.target) {
      // Don't override pasting into other inputs.
      return;
    }
    evt.preventDefault();

    const value = evt.clipboardData.getData('text').slice(0, length);
    onChange(evt, { ...props, value });
  }

  function focusPrev(evt) {
    focusSibling(evt, 'prev');
  }

  function focusNext(evt) {
    focusSibling(evt, 'next');
  }

  function focusSibling(evt, type) {
    const el = evt.target;
    const sibling = type === 'next' ? el.nextSibling : el.previousSibling;
    if (sibling) {
      setTimeout(() => {
        sibling.focus();
      }, 0);
    } else {
      evt.preventDefault();
    }
  }

  onMount(() => {
    window.addEventListener('paste', handleOnPaste);
    ref.current.focus();
  });

  onUnmount(() => {
    window.removeEventListener('paste', handleOnPaste);
  });

  const ref = useRef();

  return (
    <Form.Field
      className={className}
      style={{
        '--itemsCount': length,
      }}>
      {characters.map((character, i) => {
        const tabIndex = i <= value.length ? '0' : '';
        const className = getElementClass('character');
        return (
          <div
            key={i}
            ref={i === 0 ? ref : null}
            data-index={i}
            tabIndex={tabIndex}
            className={className}
            onKeyDown={onKeyDown}>
            {character}
          </div>
        );
      })}
    </Form.Field>
  );
}

CodeField.defaultProps = {
  value: '',
  length: 6,
  onChange: () => {},
  onComplete: () => {},
};
