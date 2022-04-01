import { debounce } from 'lodash';

const CUSTOM_HANDLERS = {
  onLongPress: (el, options) => {
    const local = { ...options };
    delete options.onMouseDown;
    delete options.onMouseMove;
    delete options.onMouseUp;
    return attachLongPress(el, local);
  },
};

export function attachEvents(...args) {
  const [el, options] = resolveArgs(args);
  const returns = [];

  for (let [name, handler] of Object.entries(options)) {
    const customEvent = CUSTOM_HANDLERS[name];
    if (customEvent) {
      returns.push(customEvent(el, options, handler));
    }
  }

  for (let [name, handler] of Object.entries(options)) {
    if (!CUSTOM_HANDLERS[name]) {
      name = name.slice(2).toLowerCase();
      returns.push(attachEvent(el, name, handler));
    }
  }

  function remove() {
    for (let { remove } of returns) {
      remove();
    }
  }

  return { remove };
}

export function attachEvent(el, name, handler) {
  el.addEventListener(name, handler);
  function remove() {
    el.removeEventListener(name, handler);
  }
  return { remove };
}

export function attachLongPress(el, options) {
  const { delay = 300, threshold = 6 } = options;

  let origin;
  let isLongPress;

  const awaitLong = debounce(() => {
    isLongPress = true;
  }, delay);

  function cancel() {
    isLongPress = false;
    awaitLong.cancel();
    el.removeEventListener('mousemove', onMouseMove);
  }

  function onMouseDown(evt) {
    origin = evt;
    isLongPress = false;
    fireEvent('onMouseDown', options, evt);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    awaitLong();
  }

  function onMouseUp(evt) {
    const meta = {
      relatedTarget: origin.target,
    };
    if (isLongPress) {
      fireEvent('onLongPress', options, evt, meta);
    } else {
      fireEvent('onMouseUp', options, evt, meta);
    }
    cancel();
    el.removeEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(evt) {
    const dx = evt.clientX - origin.clientX;
    const dy = evt.clientY - origin.clientY;
    const delta = Math.max(Math.abs(dx), Math.max(dy));
    if (delta > threshold) {
      cancel();
    }
  }

  function remove() {
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseup', onMouseUp);
  }

  el.addEventListener('mousedown', onMouseDown);

  return { remove };
}

function resolveArgs(args) {
  if (args.length === 1) {
    return [document.documentElement, ...args];
  } else {
    return args;
  }
}

function fireEvent(name, options, ...args) {
  if (options[name]) {
    options[name](...args);
  }
}
