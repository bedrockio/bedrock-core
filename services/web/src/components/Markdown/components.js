import { deburr, kebabCase } from 'lodash';

import Code from 'components/Code';
import { ContentLink } from 'components/Link';

export default {
  a: link,
  h1: linkHeader('h1'),
  h2: linkHeader('h2'),
  h3: linkHeader('h3'),
  h4: linkHeader('h4'),
  h5: linkHeader('h5'),
  h6: linkHeader('h6'),
  script: stripScript,
  pre: codeBlock,
};

function link(props) {
  const { href, children } = props;
  return <ContentLink href={href}>{children}</ContentLink>;
}

function linkHeader(Element) {
  return ({ children }) => {
    const id = kebabCase(deburr(nodeToText(children)));
    return <Element id={id}>{children}</Element>;
  };
}

function stripScript() {
  // Strip script tags.
  return <em>removed</em>;
}

// Avoid deep nesteing pre with code blocks.
// Clean this up later.
function codeBlock(props) {
  const child = props.children;
  const isCode =
    child?.type === 'code' &&
    typeof child?.props?.children === 'string' &&
    (child?.props?.className || '').startsWith('language-');
  if (isCode) {
    const language = child.props.className.match(/^language-(\w+)$/)?.[1];
    return <Code language={language}>{child.props.children}</Code>;
  } else {
    return <pre {...props} />;
  }
}

function nodeToText(node) {
  if (typeof node === 'string') {
    return node;
  } else if (Array.isArray(node)) {
    return node.map(nodeToText).join('');
  } else if (node?.props.children) {
    return nodeToText(node.props.children);
  } else {
    return '';
  }
}
