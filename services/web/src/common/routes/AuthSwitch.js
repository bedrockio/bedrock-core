import React from 'react';
import { observer, inject } from 'mobx-react';
import { Route } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';

@inject('appSession', 'me')
@observer
export default class AuthSwitch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  async componentDidMount() {
    try {
      if (this.props.appSession.isLoggedIn()) {
        await this.props.me.fetch('boot');
      }
      this.setState({
        loading: false
      });
    } catch (err) {
      // TODO: make this a better check
      if (err.message === 'bad jwt token') {
        this.props.appSession.setToken(null);
        this.setState({
          loading: false,
        });
      }
    }
  }

  render() {
    const { to, exact } = this.props;
    return (
      <Route
        to={to}
        exact={exact}
        render={this.renderRoute}
      />
    );
  }

  renderRoute = props => {
    const {
      loggedIn: LoggedInComponent,
      loggedOut: LoggedOutComponent
    } = this.props;
    if (this.state.loading) {
      return <Loader active />;
    } else if (this.props.appSession.isLoggedIn()) {
      return <LoggedInComponent {...props} />;
    } else {
      return <LoggedOutComponent {...props} />;
    }
  }
}
