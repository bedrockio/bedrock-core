import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { request } from 'utils/api';

import Overview from './Overview';
import Products from './Products';
import List from './List';

export default class Shops extends React.Component {
  state = {
    shop: null,
    error: null,
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

  fetchShop = async () => {
    const { id } = this.props.match.params;
    if (id) {
      try {
        this.setState({
          shop: null,
          error: null,
        });
        const { data } = await request({
          method: 'GET',
          path: `/1/shops/${id}`,
        });
        this.setState({
          shop: data,
        });
      } catch(error) {
        this.setState({
          error,
        });
      }
    } else {
      this.setState({
        shop: null,
      });
    }
  };

  render() {
    const { shop, error } = this.state;
    const { id } = this.props.match.params;
    return (
      <Switch>
        <Route path="/shops" component={List} exact />
        <Route
          exact
          path="/shops/:id/products"
          render={(props) => <Products {...props} {...this.state} id={id} onSave={this.fetchShop} />}
        />
        <Route
          exact
          path="/shops/:id"
          render={(props) => <Overview {...props} {...this.state} id={id} onSave={this.fetchShop} />}
        />
      </Switch>
    );
  }
}
