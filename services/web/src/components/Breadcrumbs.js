import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'semantic';

import Layout from './Layout';

export default class Breadcrumbs extends React.Component {
  getPath() {
    const { link, path } = this.props;
    return link ? [link] : path;
  }

  render() {
    const { active } = this.props;
    return (
      <div style={{ marginBottom: '5px' }}>
        <Breadcrumb size="mini">
          <Breadcrumb.Section>
            <Link to="/">Home</Link>
          </Breadcrumb.Section>
          {this.getPath().map((link, i) => {
            return (
              <React.Fragment key={i}>
                <Breadcrumb.Divider icon="chevron-right" />
                <Breadcrumb.Section>{link}</Breadcrumb.Section>
              </React.Fragment>
            );
          })}
          {active && <Breadcrumb.Divider icon="chevron-right" />}
          <Breadcrumb.Section active>{active}</Breadcrumb.Section>
        </Breadcrumb>
        <Layout.Group>{this.props.children}</Layout.Group>
      </div>
    );
  }
}

Breadcrumbs.propTypes = {
  active: PropTypes.node,
  link: PropTypes.node,
  path: PropTypes.arrayOf(PropTypes.node),
};

Breadcrumbs.defaultProps = {
  path: [],
};
