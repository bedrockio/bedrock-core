import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Loader } from 'semantic';
import { request } from 'utils/api';

import NotFound from 'screens/NotFound';

import Overview from './Overview';

export default class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchUser();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchUser();
    }
  }

  onSave = () => {
    this.fetchUser();
  };

  async fetchUser() {
    const { id } = this.props.match.params;
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: `/1/users/${id}`,
      });
      this.setState({
        user: data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  render() {
    const { loading, error } = this.state;
    if (loading) {
      return <Loader active>Loading</Loader>;
    } else if (error) {
      return (
        <NotFound
          link={<Link to="/users">Users</Link>}
          message="Sorry that user wasn't found."
        />
      );
    }
    return (
      <Switch>
        <Route
          exact
          path="/users/:id"
          render={(props) => (
            <Overview {...props} {...this.state} onSave={this.onSave} />
          )}
        />
        <Route component={NotFound} />
      </Switch>
    );
  }
}
