import React from 'react';
import { Header } from 'react-navigation';

import { Native, Components, styles } from 'app';

export default (props) => (
  <Native.KeyboardAvoidingView
    behavior="padding"
    keyboardVerticalOffset={
      props.screenHeaderPresent === false ? 0 : Header.HEIGHT
    }
    enabled
    style={styles.flex}
  >
    <Native.ScrollView
      keyboardShouldPersistTaps="always"
      contentContainerStyle={[styles.stretch, { flex: 0, flexGrow: 1 }]}
    >
      <Components.Form {...props} />
    </Native.ScrollView>
  </Native.KeyboardAvoidingView>
);
