import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { request } from 'utils/api';

import List from './List';
import Overview from './Overview';

export default class Users extends React.Component {

  state = {
    user: null,
    error: null,
  };

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchUser();
    }
  }

  fetchUser = async () => {
    const { id } = this.props.match.params;
    if (id) {
      try {
        this.setState({
          user: null,
          error: null,
        });
        const { data } = await request({
          method: 'GET',
          path: `/1/users/${id}`,
        });
        this.setState({
          user: data,
        });
      } catch(error) {
        this.setState({
          error,
        });
      }
    } else {
      this.setState({
        user: null,
      });
    }
  };

  render() {
    return (
      <Switch>
        <Route path="/users" component={List} exact />
        <Route
          exact
          path="/users/:id"
          render={(props) => (
            <Overview {...props} {...this.state} onSave={this.fetchUser} />
          )}
        />
      </Switch>
    );
  }
}
