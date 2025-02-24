// Helper that provides methods to easily create
// BEM style block/element/modifier classes.

export function useClass(block, ...args) {
  let extra;
  let modifiers = [];
  if (args[0] && typeof args[0] === 'object') {
    extra = args[0].className;
    modifiers = args.slice(1);
  } else {
    modifiers = args;
  }
  const className = getClassNames(block, modifiers, extra);
  return {
    className,
    getElementClass(element, ...modifiers) {
      return getClassNames(`${block}__${element}`, modifiers);
    },
  };
}

function getClassNames(base, modifiers, extra) {
  const classes = [
    base,
    ...modifiers.filter((m) => m).map((m) => `${base}--${m}`),
  ];
  if (extra) {
    classes.push(extra);
  }
  return classes.join(' ');
}
