import { Helmet } from 'react-helmet-async';

export default function MetaLocation() {
  const url = `${location.origin}${location.pathname}`;
  return (
    <Helmet>
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
