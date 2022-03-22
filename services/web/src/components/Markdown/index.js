import React from 'react';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

import bem from 'helpers/bem';

import Code from './Code';
import Link from './Link';
import Paragraph from './Paragraph';

import 'github-markdown-css';
import './markdown.less';

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
          components={{
            a: Link,
            script: () => {
              // Strip script tags even if we have flagged
              // the source as trusted just in case.
              return <em>removed</em>;
            },
            p: (props) => {
              return <Paragraph {...this.props} {...props} />;
            },
            pre: (props) => {
              // Don't render a pre tag as the syntax highlighter will do
              // this as well and styles will conflict.
              return props.children;
            },
            code: Code,
            ...this.props.components,
          }}>
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
