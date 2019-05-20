import React from 'react';
import { Grid } from 'semantic-ui-react';

export default (props) => (
  <div style={{ height: '100%' }}>
    <Grid style={{ minHeight: '100%' }} centered verticalAlign="middle">
      <Grid.Column
        style={{ maxWidth: props.maxWidth || '550px', margin: '40px 0' }}
      >
        {props.children}
      </Grid.Column>
    </Grid>
  </div>
);
