import React from 'react';
import { withSession } from 'stores';
import { screen } from 'helpers';

@screen
@withSession
export default class Home extends React.Component {

  componentDidMount() {
    this.props.history.replace('/shops');
  }

  render() {
    const { user } = this.context;
    return (
      <div>
        Hello {user.name} ({user.email}) from dashboard
      </div>
    );
  }
}
