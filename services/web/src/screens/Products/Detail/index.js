import React from 'react';
import { Link , Switch, Route } from 'react-router-dom';
import { Loader } from 'semantic';

import { Protected } from 'helpers/routes';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';
import DetailsContext from './Context';

export default class ProductDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      error: null,
      loading: true,
    };
  }

  onReload = () => {
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
        path: `/1/products/${id}`,
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
          link={<Link to="/products">Products</Link>}
          message="Sorry that product wasn't found."
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
          <Protected exact path="/products/:id" allowed={Overview} />
          <Route component={NotFound} />
        </Switch>
      </DetailsContext.Provider>
    );
  }
}
