import React from 'react';
import inject from 'stores/inject';
import AppWrapper from 'components/AppWrapper';

@inject('me')
export default class Home extends React.Component {

  componentDidMount() {
    this.props.history.replace('/shops');
  }

  render() {
    const { user } = this.context.me;
    return (
      <AppWrapper>
        Hello {user.name} ({user.email}) from dashboard
      </AppWrapper>
    );
  }
}
