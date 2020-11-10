import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import { Breadcrumbs, NotFound } from 'components';
import { request } from 'utils/api';

import List from './List';
import Overview from './Overview';

// --- Generator: imports
import Products from './Products';
// --- Generator: end

export default class Shops extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      shop: null,
      error: null,
      onSave: this.fetchShop,
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
      } catch (error) {
        this.setState({
          error,
        });
      }
    } else {
      this.setState({
        shop: null,
        error: null,
      });
    }
  };

  render() {
    const { id } = this.props.match.params;
    const { shop, error } = this.state;
    const loading = id && !shop && !error;
    return (
      <React.Fragment>
        {loading ? (
          <Loader active>Loading</Loader>
        ) : (error) ? (
          <React.Fragment>
            <Breadcrumbs
              link={<Link to="/shops">Shops</Link>}
              active="Not Found"
            />
            <NotFound message="Sorry that shop wasn't found." />
          </React.Fragment>
        ) : (
          <Switch>
            <Route path="/shops" component={List} exact />
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
        )}
      </React.Fragment>
    );
  }
}
