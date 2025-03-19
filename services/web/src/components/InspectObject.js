import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomDark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

SyntaxHighlighter.registerLanguage('json', json);

export default class InspectObject extends React.Component {
  render() {
    const { object } = this.props;
    return (
      <>
        <SyntaxHighlighter language="json" style={atomDark}>
          {JSON.stringify(object || {}, null, 2)}
        </SyntaxHighlighter>
      </>
    );
  }
}
