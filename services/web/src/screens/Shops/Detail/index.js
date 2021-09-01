import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Protected } from 'helpers/routes';
import { Loader } from 'semantic';
import { request } from 'utils/api';

import NotFound from 'screens/NotFound';
import Overview from './Overview';

// --- Generator: detail-imports
import Products from './Products';
// --- Generator: end

export default class ShopDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shop: null,
      error: null,
      loading: true,
    };
  }

  onSave = () => {
    this.fetchShop();
  };

  componentDidMount() {
    this.fetchShop();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchShop();
    }
  }

  async fetchShop() {
    const { id } = this.props.match.params;
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: `/1/shops/${id}`,
      });
      this.setState({
        shop: data,
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

    const props = {
      ...this.state,
      onSave: this.onSave,
    };
    return (
      <Switch>
        <Protected exact path="/shops/:id" allowed={Overview} {...props} />
        {/* --- Generator: routes */}
        <Protected
          exact
          path="/shops/:id/products"
          allowed={Products}
          {...props}
        />
        {/* --- Generator: end */}
        <Route component={NotFound} />
      </Switch>
    );
  }
}
