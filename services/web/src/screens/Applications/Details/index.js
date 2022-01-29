import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Protected } from 'helpers/routes';
import { Loader } from 'semantic';
import { request } from 'utils/api';

import NotFound from 'screens/NotFound';

import Overview from './Overview';
import Logs from './Logs';

export default class ApplicationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      application: null,
      error: null,
      loading: true,
    };
  }

  onSave = () => {
    this.fetchApplication();
  };

  componentDidMount() {
    this.fetchApplication();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchApplication();
    }
  }

  async fetchApplication() {
    const { id } = this.props.match.params;
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: `/1/applications/${id}`,
      });
      this.setState({
        application: data,
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
          link={<Link to="/products">Application</Link>}
          message="Sorry that product wasn't found."
        />
      );
    }

    return (
      <Switch>
        <Protected
          exact
          path="/applications/:id"
          allowed={Overview}
          onSave={this.onSave}
          {...this.state}
        />
        <Protected
          exact
          path="/applications/:id/logs"
          allowed={Logs}
          onSave={this.onSave}
          {...this.state}
        />
        <Route component={NotFound} />
      </Switch>
    );
  }
}
