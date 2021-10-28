import React from 'react';
import screen from 'helpers/screen';
import { withRouter } from 'react-router';

class Home extends React.Component {
  componentDidMount() {
    //this.props.history.replace('/shops');
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

export default screen(withRouter(Home));
