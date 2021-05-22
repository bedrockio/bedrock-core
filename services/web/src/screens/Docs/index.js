import React, { createRef } from 'react';
import { startCase, kebabCase } from 'lodash';
import {
  Container,
  Menu,
  Message,
  Breadcrumb,
  Divider,
  Grid,
  Sticky,
  Ref,
  Segment,
  Dropdown
} from 'semantic';
import { Switch, Route, Link, NavLink } from 'react-router-dom';
import StandardPage from './StandardPage';
import PageLoader from 'components/PageLoader';

import { request } from '../../utils/api';
import { screen } from 'helpers';

import * as DOCS from 'docs';

const PAGES = Object.keys(DOCS).map((name) => {
  return {
    id: kebabCase(name),
    name: startCase(name.toLowerCase()),
    markdown: DOCS[name],
  };
});

function stateForParams(params) {
  const { id } = params;
  return {
    pageId: id,
    page: id ? PAGES.find((p) => p.id === id) : PAGES[0],
  };
}

@screen
export default class Docs extends React.Component {
  static layout = 'Portal';
  contextRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      openApi: null,
      loading: true,
      error: null,
      ...stateForParams(this.props.match.params),
    };
  }

  state = {
    loading: true,
    error: null,
  };

  async componentDidMount() {
    try {
      const openApi = await request({
        method: 'GET',
        path: '/openapi.lite.json',
      });
      this.setState(
        {
          loading: false,
          openApi,
        },
        () => {
          this.checkJumpLink();
        }
      );
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.setState({
        ...stateForParams(this.props.match.params),
      });
      window.scrollTo(0, 0);
    }
  }

  checkJumpLink() {
    const { hash } = this.props.location;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView();
      }
    }
  }

  render() {
    const { page, loading, openApi } = this.state;
    const { me } = this.props;

    if (loading) {
      return <PageLoader />;
    }

    if (!page)
      return (
        <Container>
          <Message error content="Page not found" />
        </Container>
      );

    return (
      <React.Fragment>
          <Breadcrumb size="mini">
            <Breadcrumb.Section link as={Link} to="/docs/api">
              API Docs
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="chevron-right" />
            <Breadcrumb.Section>{page.name}</Breadcrumb.Section>
          </Breadcrumb>
        <Divider hidden />
        <Grid>
          <Grid.Row>  
            {this.renderMenu()}
            <Grid.Column mobile={16} tablet={13} computer={13}>
              <Ref innerRef={this.contextRef}>
                <Switch>
                  {PAGES.map((page) => {
                    return (
                      <Route
                        key={page.id}
                        exact
                        path={`/docs/api/${page.id}`}
                        component={(props) => (
                          <StandardPage
                            {...props}
                            me={me}
                            openApi={openApi}
                            page={page}
                          />
                        )}
                      />
                    );
                  }).concat([
                    <Route
                      key="index"
                      exact
                      path={`/docs/api`}
                      component={(props) => (
                        <StandardPage
                          {...props}
                          me={me}
                          openApi={openApi}
                          page={PAGES[0]}
                        />
                      )}
                    />,
                  ])}
                </Switch>
              </Ref>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider hidden />
      </React.Fragment>
    );
  }

  renderMenu() {
    const { pageId } = this.state;
    return (
      <React.Fragment>
        <Grid.Column width={3} only="tablet computer">
          <Sticky offset={131} context={this.contextRef}>
            <Menu fluid pointing secondary vertical>
              {PAGES.map(({ id, name }) => {
                return (
                  <Menu.Item
                    key={id}
                    exact
                    name={name}
                    active={pageId === id}
                    to={`/docs/api/${id}`}
                    as={NavLink}
                  />
                );
              })}
            </Menu>
          </Sticky>
        </Grid.Column>
        <Grid.Column width={16} only="mobile" style={{ zIndex:'1', marginBottom: '20px' }}>
          <Menu fluid>
            <Dropdown text="API Docs Menu" className="link item" fluid style={{ justifyContent:'space-between' }}>
              <Dropdown.Menu>
                {PAGES.map(({ id, name }) => {
                      return (
                        <Dropdown.Item
                          key={id}
                          exact
                          name={name}
                          active={pageId === id}
                          to={`/docs/api/${id}`}
                          as={NavLink}
                        >
                        {name}
                        </Dropdown.Item>
                      );
                    })}
              </Dropdown.Menu>
            </Dropdown>
          </Menu>
        </Grid.Column>
      </React.Fragment>
    );
  }
}
