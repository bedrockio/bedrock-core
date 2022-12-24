import React from 'react';
import { Dimmer, Loader } from 'semantic';

import PageCenter from './PageCenter';

export default (props) => (
  <PageCenter>
    <Dimmer inverted active>
      <Loader {...props} inverted />
    </Dimmer>
  </PageCenter>
);
