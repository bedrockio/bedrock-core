// Helper that provides methods to easily create
// BEM style block/element/modifier classes.

import { kebabCase } from 'lodash';

export default function (Component) {
  const block = kebabCase(Component.name);

  function getClassNames(name, modifiers, extra) {
    const classes = [
      name,
      ...modifiers.filter((m) => m).map((m) => `${name}--${m}`),
    ];
    if (extra) {
      classes.push(extra);
    }
    return classes;
  }

  return class extends Component {
    getBlockClass = (...args) => {
      return getClassNames(
        block,
        this.getModifiers?.(...args) || [],
        this.props.className
      ).join(' ');
    };

    getElementClass = (name, ...modifiers) => {
      return getClassNames(`${block}__${name}`, modifiers).join(' ');
    };

    getModifierClass = (modifier) => {
      return `${block}--${modifier}`;
    };
  };
}
