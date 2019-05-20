import React from 'react';

import { Native, Components, helpers, styles } from 'app';

export default ({ data: item }) => (
  <Native.View style={styles.listBox}>
    <React.Fragment>
      <Native.Text style={[styles.titleText, { textAlign: 'center' }]}>
        {item.name}
      </Native.Text>
      <Native.Text style={[styles.text, { textAlign: 'center' }]}>
        {item.description}
      </Native.Text>
    </React.Fragment>
  </Native.View>
);
