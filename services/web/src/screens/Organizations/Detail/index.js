import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Protected } from 'helpers/routes';
import { Loader } from 'semantic';
import { request } from 'utils/api';

import NotFound from 'screens/NotFound';
import DetailsContext from './Context';

import Overview from './Overview';

export default class OrganizationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      error: null,
      loading: true,
    };
  }

  onSave = () => {
    this.fetchItem();
  };

  componentDidMount() {
    this.fetchItem();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchItem();
    }
  }

  async fetchItem() {
    const { id } = this.props.match.params;
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: `/1/organizations/${id}`,
      });
      this.setState({
        item: data,
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
          link={<Link to="/organizations">Organization</Link>}
          message="Sorry that organization wasn't found."
        />
      );
    }

    return (
      <DetailsContext.Provider
        value={{
          ...this.state,
          reload: this.onReload,
        }}>
        <Switch>
          <Protected
            exact
            path="/organizations/:id"
            allowed={Overview}
            onSave={this.onSave}
            {...this.state}
          />
          <Route component={NotFound} />
        </Switch>
      </DetailsContext.Provider>
    );
  }
}
