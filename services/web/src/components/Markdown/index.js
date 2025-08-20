import ReactMarkdown from 'react-markdown';

import { useClass } from 'helpers/bem';

import components from './components';
import './markdown.less';

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
