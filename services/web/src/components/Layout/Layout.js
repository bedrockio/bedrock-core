// Component that wraps simple flexbox layouts.
//
// Usage:
//
// 1. Simple horizontal layout that aligns its children vertically center:
//
// <Layout horizontal center>
//   <el />
//   <el />
// </Layout>
//
// display: flex;
// flex-flow: row;
// align-items: center;
//
//
// 2. A horizontal spread layout that pushes children to their edges:
//
// <Layout horizontal center spread>
//   <el />
//   <el />
// </Layout>
//
// display: flex;
// flex-flow: row;
// align-items: center;
// justify-content: space-between;
//
//
// 3. A perfectly centered layout that aligns both vertically and horizontally center:
//
// <Layout center>
//   <el />
// </Layout>
//
// display: flex;
// align-items: center;
// justify-content: center;
//
//
// 4. Other layout patterns can be achieved by mixing vertical and horizontal props:
//
// <Layout horizontal top />
// <Layout horizontal center />
// <Layout horizontal bottom />
// <Layout vertical left />
// <Layout vertical center />
// <Layout vertical right />
//
//
// 5. Grouping content:
//
// <Layout center>
//   <Layout.Group>
//     <el />
//     <el />
//   </Layout.Group>
//   <Layout.Group>
//     <el />
//     <el />
//   </Layout.Group>
// </Layout>
//
// 6. Other props:
//
// stackable - Like semantic UI stacks on mobile
// wrap - Allows wrapping of content
// stretch - Applied align-items: stretch (children grow vertically or horizontally)
// padded - Applies padding between items. (also <Layout extra padded />).
// baseline - Applies align-items: baseline.
// reversed - Layouts can be reversed.

import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import Group from './Group';

import './layout.less';

export default class Layout extends React.Component {

  static Group = Group;

  getClassNames() {
    const classNames = ['layout'];
    const props = omit(this.props, 'children');
    for (let className of Object.keys(props)) {
      classNames.push(className);
    }
    return classNames.join(' ');
  }

  render() {
    return (
      <div className={this.getClassNames()}>
        {this.props.children}
      </div>
    );
  }

}

Layout.propTypes = {
  wrap: PropTypes.bool,
  center: PropTypes.bool,
  stretch: PropTypes.bool,
  vertical: PropTypes.bool,
  horizontal: PropTypes.bool,
  stackable: PropTypes.bool,
  spread: PropTypes.bool,
  padded: PropTypes.bool,
  baseline: PropTypes.bool,
  reversed: PropTypes.bool,
  bottom: PropTypes.bool,
  right: PropTypes.bool,
  extra: PropTypes.bool,
  top: PropTypes.bool,
};
