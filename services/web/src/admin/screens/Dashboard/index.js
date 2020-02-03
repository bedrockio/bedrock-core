import React from 'react';
import { observer, inject } from 'mobx-react';
import AppWrapper from 'admin/components/AppWrapper';

@inject('me')
@observer
export default class Home extends React.Component {
  render() {
    return (
      <AppWrapper>
        Hello {this.props.me.user.name} ({this.props.me.user.email}) from
        dashboard
      </AppWrapper>
    );
  }
}
