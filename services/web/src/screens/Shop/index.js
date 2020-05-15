import React from 'react';
import { observer, inject } from 'mobx-react';
import { Switch, Route, Link } from 'react-router-dom';
import AppWrapper from 'components/AppWrapper';

import { Container, Divider, Breadcrumb, Button } from 'semantic-ui-react';
import Menu from './Menu';
import PageLoader from 'components/PageLoader';
import Overview from './Overview';
import Products from './Products';
import EditShop from 'components/modals/EditShop';

@inject('shops')
@observer
export default class Shop extends React.Component {

  state = {
    shop: null,
  };

  async componentDidMount() {
    const { id } = this.props.match.params;
    this.setState({
      shop: await this.props.shops.fetch(id),
    });
  }

  render() {
    const { shop } = this.state;
    return (
      <AppWrapper>
        <Container>
          {shop && (
            <EditShop
              initialValues={shop}
              trigger={
                <Button
                  floated="right"
                  style={{ marginTop: '-5px' }}
                  primary
                  icon="setting"
                  content="Settings"
                />
              }
            />
          )}
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
