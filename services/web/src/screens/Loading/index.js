import React from 'react';

import Meta from 'components/Meta';

import { Spinner } from '@/components/ui/spinner';

export default class LoadingScreen extends React.Component {
  render() {
    return (
      <>
        <Meta title="Loading..." />
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-6" />
        </div>
      </>
    );
  }
}
