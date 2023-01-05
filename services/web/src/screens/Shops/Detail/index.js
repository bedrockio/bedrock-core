import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { Loader } from 'semantic';

import { Protected } from 'helpers/routes';
import { request } from 'utils/api';
import NotFound from 'screens/NotFound';

import Overview from './Overview';
import DetailsContext from './Context';

// --- Generator: detail-imports
import Products from './Products';
// --- Generator: end

export default class ShopDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      error: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchItem();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchItem();
    }
  }

  onReload = () => {
    this.fetchItem();
  };

  async fetchItem() {
    const { id } = this.props.match.params;
    this.setState({
      error: null,
      loading: true,
    });
    try {
      const { data } = await request({
        method: 'GET',
        path: `/1/shops/${id}`,
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
          link={<Link to="/shops">Shops</Link>}
          message="Sorry that shop wasn't found."
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
          <Protected exact path="/shops/:id" allowed={Overview} />
          {/* --- Generator: routes */}
          <Protected exact path="/shops/:id/products" allowed={Products} />
          {/* --- Generator: end */}
          <Route component={NotFound} />
        </Switch>
      </DetailsContext.Provider>
    );
  }
}
