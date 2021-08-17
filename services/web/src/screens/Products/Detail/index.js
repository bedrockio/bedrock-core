import React from 'react';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import { Loader } from 'semantic';
import { request } from 'utils/api';

import NotFound from 'screens/NotFound';

import Overview from './Overview';

export default class ProductDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      error: null,
      loading: true,
    };
  }

  onSave = () => {
    this.fetchProduct();
  };

  componentDidMount() {
    this.fetchProduct();
  }

  componentDidUpdate(lastProps) {
    const { id } = this.props.match.params;
    if (id !== lastProps.match.params.id) {
      this.fetchProduct();
    }
  }

  async fetchProduct() {
    const { id } = this.props.match.params;
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: `/1/products/${id}`,
      });
      this.setState({
        product: data,
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
          link={<Link to="/products">Products</Link>}
          message="Sorry that product wasn't found."
        />
      );
    }

    return (
      <Switch>
        <Route
          exact
          path="/products/:id"
          render={(props) => (
            <Overview {...props} {...this.state} onSave={this.onSave} />
          )}
        />

        <Route component={NotFound} />
      </Switch>
    );
  }
}
