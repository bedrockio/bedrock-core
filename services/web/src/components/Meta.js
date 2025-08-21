import { useLocation } from '@bedrockio/router';
import { Helmet } from 'react-helmet-async';

import { APP_NAME, APP_URL } from 'utils/env';

export default function Meta(props) {
  const { title, children } = props;
  const { pathname } = useLocation();

  return (
    <Helmet>
      <link rel="canonical" href={APP_URL + pathname} />
      <title>{`${title} | ${APP_NAME}`}</title>
      {children}
    </Helmet>
  );
}
