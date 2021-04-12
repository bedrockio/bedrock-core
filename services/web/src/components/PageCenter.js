import React from 'react';
import { Grid } from 'semantic';

export default (props) => (
  <Grid style={{ minHeight: '100vh' }} centered verticalAlign="middle">
    <Grid.Column
      style={{ maxWidth: props.maxWidth || '550px', margin: '40px 0' }}>
      {props.children}
    </Grid.Column>
  </Grid>
);
