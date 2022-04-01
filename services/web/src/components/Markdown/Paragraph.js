import React from 'react';

export default class ParagraphNode extends React.Component {
  getElement() {
    const { inline } = this.props;
    if (inline) {
      return 'span';
    } else {
      return this.isAtomic() ? 'div' : 'p';
    }
  }

  hasText() {
    const { node } = this.props;
    return node.children.some(({ type, value }) => {
      return type === 'text' && value.trim();
    });
  }

  isAtomic() {
    return !this.hasText();
  }

  render() {
    const { children, style } = this.props;
    const atomic = this.isAtomic();
    const Element = this.getElement();
    return (
      <Element className={atomic ? 'atomic' : 'text'} style={style}>
        {children}
      </Element>
    );
  }
}
