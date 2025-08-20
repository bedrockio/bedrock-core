import React from 'react';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';

export default function NotFound({ message }) {
  return (
    <React.Fragment>
      <Meta title="Not Found" />
      <PageHeader title={message || 'Sorry that page was not found.'} />
    </React.Fragment>
  );
}
