import React, { createRef } from 'react';
import { Switch, Route, Link, NavLink } from 'react-router-dom';
import { startCase, kebabCase } from 'lodash';
import { Breadcrumb, Container, Divider, Menu, Message, Ref } from 'semantic';
import { Layout } from 'components/Layout';
import { Menu as ResponsiveMenu } from 'components/Responsive';
import { APP_NAME } from 'utils/env';

import StandardPage from './StandardPage';
import Contenxt from './Context';
import PageLoader from 'components/PageLoader';

import { request } from 'utils/api';
import screen from 'helpers/screen';

import DOCS from 'docs';

const DEFAULT_PAGE_ID = 'getting-started';

const PAGES = Object.keys(DOCS).map((name) => {
  return {
    id: kebabCase(name),
    name: startCase(name.toLowerCase()),
    markdown: DOCS[name],
  };
});

function stateForParams(params) {
  const { id = DEFAULT_PAGE_ID } = params;
  return {
    pageId: id,
    page: id ? PAGES.find((p) => p.id === id) : getDefaultPage(),
  };
}

function getDefaultPage() {
  return PAGES.find((page) => {
    return page.id === DEFAULT_PAGE_ID;
  });
}

@screen
export default class Docs extends React.Component {
  static layout = 'portal';

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
    const { page, loading, openApi, pageId } = this.state;
    const { me } = this.props;

    if (loading) {
      return <PageLoader />;
    }

    if (!page) {
      return (
        <Container>
          <Message error content="Page not found" />
        </Container>
      );
    }

    return (
      <React.Fragment>
        <h1 className="primary">{APP_NAME} API v1</h1>
        <Divider hidden />
        <Breadcrumb size="mini">
          <Breadcrumb.Section link as={Link} to="/docs">
            API Docs
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="chevron-right" />
          <Breadcrumb.Section>{page.name}</Breadcrumb.Section>
        </Breadcrumb>
        <Divider hidden />
        <Layout horizontal top stackable>
          <Layout.Group size="200px" fixed>
            <ResponsiveMenu contextRef={this.contextRef} title="Docs Menu">
              {PAGES.map(({ id, name }) => {
                return (
                  <Menu.Item
                    key={id}
                    exact
                    name={name}
                    active={pageId === id}
                    to={`/docs/${id}`}
                    as={NavLink}
                  />
                );
              })}
            </ResponsiveMenu>
          </Layout.Group>
          <Layout.Spacer size={1} />
          <Layout.Group>
            <Contenxt>
              <Ref innerRef={this.contextRef}>
                <Switch>
                  {PAGES.map((page) => {
                    return (
                      <Route
                        key={page.id}
                        exact
                        path={`/docs/${page.id}`}
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
                      path="/docs"
                      exact
                      component={(props) => (
                        <StandardPage
                          {...props}
                          me={me}
                          openApi={openApi}
                          page={getDefaultPage()}
                        />
                      )}
                    />,
                  ])}
                </Switch>
              </Ref>
            </Contenxt>
          </Layout.Group>
        </Layout>
        <Divider hidden />
      </React.Fragment>
    );
  }
}
