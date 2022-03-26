import React, { PureComponent } from 'react';
import { Icon } from 'semantic';
import { kebabCase } from 'lodash';
import { JumpLink } from 'components/Link';

function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

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
      <React.Fragment>
        {link ? (
          <JumpLink.Target id={slug}>
            <Component className="linked-heading">
              {this.renderLink(slug, children)}
            </Component>
          </JumpLink.Target>
        ) : (
          <Component>{children}</Component>
        )}
      </React.Fragment>
    );
  }

  renderLink(slug, children) {
    return (
      <React.Fragment>
        <JumpLink to={slug}>
          <Icon name="link" />
        </JumpLink>
        <span>{children}</span>
      </React.Fragment>
    );
  }
}
