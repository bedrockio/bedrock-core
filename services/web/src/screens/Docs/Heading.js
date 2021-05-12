import React, { PureComponent } from 'react';
import { Icon } from 'semantic';
import { kebabCase } from 'lodash';

const flatten = (text, child) => {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
};

const ROUTE_REG = /^(GET|POST|PATCH|DELETE) \/1\/(.+)$/;

import './heading.less';

export default class Heading extends PureComponent {
  render() {
    const { level, children } = this.props;
    let text = React.Children.toArray(children).reduce(flatten, '');
    text = text.replace(ROUTE_REG, '$1-$2');
    const slug = kebabCase(text.toLowerCase());
    const Component = `h${level}`;
    const link = level > 1;
    return (
      <Component id={slug} className={link ? 'linked-heading' : null}>
        {link ? this.renderLink(slug, children) : children}
      </Component>
    );
  }

  renderLink(slug, children) {
    return (
      <React.Fragment>
        <a href={`#${slug}`}>
          <Icon name="link" />
        </a>
        <span>
          {children}
        </span>
      </React.Fragment>
    );
  }
}
