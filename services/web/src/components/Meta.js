import { Helmet } from 'react-helmet-async';
import { useLocation } from '@bedrockio/router';

import { APP_URL, APP_NAME } from 'utils/env';

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
