import { get } from 'lodash';
import PropTypes from 'prop-types';

import Markdown from 'components/Markdown';

import { useDocs } from '../utils/context';

export default function DocsText(props) {
  const { type, path, modelPath } = props;

  const { docs } = useDocs();

  const value =
    get(docs, [...path, type]) ||
    (modelPath && get(docs, [...modelPath, type]));

  if (!value) {
    return null;
  } else if (type === 'description') {
    return <Markdown source={value} />;
  } else {
    return value;
  }
}

DocsText.propTypes = {
  path: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['title', 'summary', 'description']).isRequired,
  modelPath: PropTypes.array,
};
