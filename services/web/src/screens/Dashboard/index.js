import React from 'react';
import AppWrapper from 'components/AppWrapper';
import { session } from 'stores';

export default class Home extends React.Component {

  componentDidMount() {
    this.props.history.replace('/shops');
  }

  render() {
    const { user } = session;
    return (
      <AppWrapper>
        Hello {user.name} ({user.email}) from dashboard
      </AppWrapper>
    );
  }
}
