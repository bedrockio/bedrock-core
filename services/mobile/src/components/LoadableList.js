import React from 'react';

import { Components } from 'app';

export default class LoadableList extends React.Component {
  state = {
    isRefreshing: false
  };

  componentDidMount = () => this.loadItems();

  loadItems = async () => {
    this.setState({
      items: await this.props.items()
    });

    this.setIsRefreshing(false);
  };

  setIsRefreshing = (isRefreshing) =>
    this.setState({
      isRefreshing
    });

  render = () => (
    <Components.LoadableView loading={!this.state.items}>
      <Components.List
        onRefresh={this.refresh}
        refreshing={this.state.isRefreshing}
        {...this.props}
        items={this.state.items}
      />
    </Components.LoadableView>
  );

  refresh = () => {
    this.setIsRefreshing(true);
    this.loadItems();
  };
}
