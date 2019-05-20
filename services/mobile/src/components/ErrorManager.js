import React from 'react';

import { Native, helpers, constants, styles } from 'app';

export default class ErrorManager extends React.Component {
  state = {
    isError: false
  };

  render = () => {
    if (this.state.isError)
      return (
        <Native.View style={styles.center}>
          <Native.Text style={styles.titleText}>
            There was a problem
          </Native.Text>
          <Native.Text style={styles.text}>
            Please restart your phone and try opening the app again. If the
            problem persists, contact your study coordinator for assistance.
          </Native.Text>
          <Native.Button
            title="Help"
            onPress={helpers.linkTo(constants.urls.help)}
          />
        </Native.View>
      );
    else return this.props.children;
  };

  componentDidCatch = (error, info) =>
    this.setState({
      isError: true
    });
}
