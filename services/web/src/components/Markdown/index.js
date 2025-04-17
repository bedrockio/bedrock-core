import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

import { useClass } from 'helpers/bem';

import 'styles/github-markdown.less';
import './markdown.less';

import components from './components';

export default function Markdown(props) {
  const { inline, source } = props;
  const { className } = useClass('markdown');

  const Element = inline ? 'span' : 'div';
  return (
    <Element className={className}>
      <ReactMarkdown components={components}>{source}</ReactMarkdown>
    </Element>
  );
}

export { components };

Markdown.propTypes = {
  source: PropTypes.string,
  renderers: PropTypes.object,
};
