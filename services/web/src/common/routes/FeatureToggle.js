import React from 'react';
import { observer, inject } from 'mobx-react';
import { Redirect } from 'react-router-dom';

@inject('feature', 'notifications')
@observer
export default class FeatureToggle extends React.Component {

  toggleFeature() {
    const name = this.getFeatureName();
    if (this.props.feature.has(name)) {
      this.props.feature.remove(name);
      this.props.notifications.addError(`Disabled feature ${name}.`);
    } else {
      this.props.feature.add(name);
      this.props.notifications.addSuccess(`Enabled feature ${name}.`);
    }
  }

  getFeatureName() {
    return this.props.computedMatch.params.name;
  }

  featureExists() {
    return this.props.feature.exists(this.getFeatureName());
  }

  componentDidMount() {
    if (this.featureExists()) {
      this.toggleFeature();
    }
  }

  render() {
    if (this.featureExists()) {
      return <Redirect to={this.props.done} />;
    } else {
      const { unknown: Component } = this.props;
      return <Component />;
    }
  }

}
