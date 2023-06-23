import { Helmet } from 'react-helmet-async';

import { APP_NAME } from 'utils/env';

export default function MetaTitle(props) {
  const parts = [];
  parts.push(props.children);
  parts.push(APP_NAME);
  return (
    <Helmet>
      <title>{parts.join(' | ')}</title>
    </Helmet>
  );
}
