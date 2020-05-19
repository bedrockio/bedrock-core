import React from 'react';
import inject from 'stores/inject';
import AppWrapper from 'components/AppWrapper';

@inject('session')
export default class Home extends React.Component {

  componentDidMount() {
    this.props.history.replace('/shops');
  }

  render() {
    const { user } = this.context.session;
    return (
      <AppWrapper>
        Hello {user.name} ({user.email}) from dashboard
      </AppWrapper>
    );
  }
}
