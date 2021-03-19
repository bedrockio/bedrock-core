import React, { createRef } from 'react';
import { startCase, kebabCase } from 'lodash';
import { Container, Menu, Message, Breadcrumb, Divider, Grid, Sticky, Ref, Segment } from 'semantic';
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
      this.setState({
        loading: false,
        openApi,
      }, () => {
        this.checkJumpLink();
      });
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
        <Container>
          <Breadcrumb size="big">
            <Breadcrumb.Section link as={Link} to="/">
              API Docs
            </Breadcrumb.Section>
            <Breadcrumb.Divider icon="chevron-right" />
            <Breadcrumb.Section>{page.name}</Breadcrumb.Section>
          </Breadcrumb>
        </Container>
        <Divider hidden />
        <Grid>
          <Grid.Row>
            <Grid.Column width={3}>
              <Sticky offset={100} context={this.contextRef}>
                {this.renderMenu()}
              </Sticky>
            </Grid.Column>
            <Grid.Column width={13}>
              <Ref innerRef={this.contextRef}>
                <Segment basic>
                  <Switch>
                    {PAGES
                      .map((page) => {
                        return (
                          <Route
                            key={page.id}
                            exact
                            path={`/docs/${page.id}`}
                            component={(props) => <StandardPage {...props} me={me} openApi={openApi} page={page} />}
                          />
                        );
                      })
                      .concat([
                        <Route
                          key="index"
                          exact
                          path={`/docs`}
                          component={(props) => <StandardPage {...props} me={me} openApi={openApi} page={PAGES[0]} />}
                        />,
                      ])}
                  </Switch>
                </Segment>
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
      <Menu fluid pointing secondary vertical>
        {PAGES.map(({ id, name }) => {
          return <Menu.Item key={id} exact name={name} active={pageId === id} to={`/docs/${id}`} as={NavLink} />;
        })}
      </Menu>
    );
  }
}
