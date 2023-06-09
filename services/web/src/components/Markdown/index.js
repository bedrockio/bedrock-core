import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

import bem from 'helpers/bem';

import 'styles/github-markdown.less';
import './markdown.less';

import components from './components';

@bem
export default class Markdown extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { inline, source } = this.props;
    return inline !== nextProps.inline || source !== nextProps.source;
  }

  render() {
    const { inline, source } = this.props;
    const Element = inline ? 'span' : 'div';
    return (
      <Element className={this.getBlockClass()}>
        <ReactMarkdown components={components}>{source}</ReactMarkdown>
      </Element>
    );
  }
}

export { components };

Markdown.propTypes = {
  source: PropTypes.string,
  renderers: PropTypes.object,
};

Markdown.defaultProps = {
  renderers: {},
};
