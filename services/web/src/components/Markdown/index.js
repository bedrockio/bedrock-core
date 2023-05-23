import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';

import Code from 'components/Code';

import bem from 'helpers/bem';

import Link from './Link';

import 'styles/github-markdown.less';
import './markdown.less';

export const COMPONENTS = {
  a: Link,
  script: () => {
    // Strip script tags even if we have flagged
    // the source as trusted just in case.
    return <em>removed</em>;
  },
  pre: (props) => {
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
  },
};

@bem
export default class Markdown extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { inline, source } = this.props;
    return inline !== nextProps.inline || source !== nextProps.source;
  }

  render() {
    const { inline, source, trusted } = this.props;
    const Element = inline ? 'span' : 'div';
    return (
      <Element className={this.getBlockClass()}>
        <ReactMarkdown
          remarkPlugins={[gfm]}
          rehypePlugins={[...(trusted ? [rehypeRaw] : [])]}
          components={COMPONENTS}>
          {source}
        </ReactMarkdown>
      </Element>
    );
  }
}

Markdown.propTypes = {
  source: PropTypes.string,
  renderers: PropTypes.object,
  trusted: PropTypes.bool,
};

Markdown.defaultProps = {
  trusted: false,
  renderers: {},
};
