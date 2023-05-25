import PropTypes from 'prop-types';
import { get } from 'lodash';

import { useDocs } from '../utils/context';

export default function DocsPath(props) {
  const { docs } = useDocs();
  return get(docs, props.path, '');
}

DocsPath.propTypes = {
  path: PropTypes.string.isRequired,
};
