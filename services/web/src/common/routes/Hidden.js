import React from 'react';
import { observer, inject } from 'mobx-react';
import { Route } from 'react-router-dom';

@inject('feature')
@observer
export default class Hidden extends React.Component {

  render() {
    const { feature, name, disabled, component, ...rest } = this.props;
    return <Route {...rest} render={this.renderRoute} />;
  }

  renderRoute = props => {
    const { name, feature, component, disabled } = this.props;
    const Component = feature.has(name) ? component : disabled;
    return <Component {...props} />;
  }


}
