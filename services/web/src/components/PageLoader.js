import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import PageCenter from './PageCenter';

export default (props) => (
  <PageCenter>
    <Dimmer inverted active>
      <Loader {...props} inverted />
    </Dimmer>
  </PageCenter>
);
