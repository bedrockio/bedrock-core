import React from 'react';

export default class AutoFocus extends React.Component {
  constructor(props) {
    super(props);
    this.container = React.createRef();
  }

  static getElementsByTagNames(node, tagNames) {
    const allElements = [];
    tagNames.forEach((tagName) => {
      const elements = node.getElementsByTagName(tagName);
      allElements.push(...elements);
    });

    const testNode = allElements[0];

    if (!testNode) {
      return [];
    }

    // dont focus first element is a combo box / dropdown
    if (
      testNode.parentNode &&
      testNode.parentNode.getAttribute('role') === 'combobox'
    ) {
      return [];
    }

    if (testNode.sourceIndex) {
      allElements.sort(function (a, b) {
        return a.sourceIndex - b.sourceIndex;
      });
    } else if (testNode.compareDocumentPosition) {
      allElements.sort(function (a, b) {
        return 3 - (a.compareDocumentPosition(b) & 6);
      });
    }
    return allElements;
  }

  componentDidMount() {
    const node = this.container.current;
    if (!node) {
      return;
    }
    const inputs = AutoFocus.getElementsByTagNames(node, ['textarea', 'input']);
    if (!inputs.length) {
      return;
    }
    inputs[0].focus();
  }

  render() {
    return <div ref={this.container}>{this.props.children}</div>;
  }
}
