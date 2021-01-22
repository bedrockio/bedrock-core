import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Loader, Header } from 'semantic-ui-react';
import { Breadcrumbs } from 'components';
import { request } from 'utils/api';

import Overview from './Overview';

// --- Generator: imports
import Products from './Products';
// --- Generator: end

export default class ShopDetail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      shop: null,
      error: null,
      loading: true,
      onSave: this.onSave,
    };
  }

  componentDidMount() {
    this.fetchShop();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchShop();
    }
  }

  onSave = () => {
    this.fetchShop();
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
      return (
        <Loader active>Loading</Loader>
      );
    } else if (error) {
      return (
        <React.Fragment>
          <Breadcrumbs
            link={<Link to="/shops">Shops</Link>}
            active="Not Found"
          />
          <Header content="Sorry that shop wasn't found." />
        </React.Fragment>
      );
    }
    return (
      <Switch>
        <Route
          exact
          path="/shops/:id"
          render={(props) => (
            <Overview {...props} {...this.state}  />
          )}
        />
        {/* --- Generator: routes */}
        <Route
          exact
          path="/shops/:id/products"
          render={(props) => (
            <Products {...props} {...this.state} />
          )}
        />
        {/* --- Generator: end */}
      </Switch>
    );
  }
}
