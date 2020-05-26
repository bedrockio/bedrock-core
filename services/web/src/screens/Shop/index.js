import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Container, Divider, Breadcrumb, Button } from 'semantic-ui-react';
import { request } from 'utils/api';

import AppWrapper from 'components/AppWrapper';
import { Layout } from 'components/Layout';
import PageLoader from 'components/PageLoader';
import EditShop from 'components/modals/EditShop';
import Overview from './Overview';
import Products from './Products';
import Menu from './Menu';

export default class Shop extends React.Component {

  state = {
    shop: null,
  };

  componentDidMount() {
    this.fetchShop();
  }

  fetchShop = async () => {
    const { id } = this.props.match.params;
    const { data } = await request({
      method: 'GET',
      path: `/1/shops/${id}`
    });
    this.setState({
      shop: data
    });
  }

  render() {
    const { shop } = this.state;
    return (
      <AppWrapper>
        <Container>
          <Layout horizontal center spread>
            <Breadcrumb size="big">
              <Breadcrumb.Section link as={Link} to="/">
                Home
              </Breadcrumb.Section>
              <Breadcrumb.Divider icon="right chevron" />
              <Breadcrumb.Section link as={Link} to="/shops">
                Shops
              </Breadcrumb.Section>
              <Breadcrumb.Divider icon="right chevron" />
              <Breadcrumb.Section active>
                {shop?.name || 'Loading...'}
              </Breadcrumb.Section>
            </Breadcrumb>
            {shop && (
              <EditShop
                shop={shop}
                onSave={this.fetchShop}
                trigger={
                  <Button
                    primary
                    icon="setting"
                    content="Settings"
                  />
                }
              />
            )}
          </Layout>
        </Container>
        <Divider hidden />
        {!shop ? (
          <PageLoader />
        ) : (
          <React.Fragment>
            <Menu shop={shop} />
            <Divider hidden />
            <Switch>
              <Route
                exact
                path="/shops/:id/products"
                render={(props) => <Products {...props} shop={shop} />}
              />
              <Route
                exact
                path="/shops/:id"
                render={(props) => <Overview {...props} shop={shop} />}
              />
            </Switch>
          </React.Fragment>
        )}
      </AppWrapper>
    );
  }
}
