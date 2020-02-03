import React from 'react';
import { observer, inject } from 'mobx-react';
import AppWrapper from 'admin/components/AppWrapper';

@inject('me')
@observer
export default class Home extends React.Component {
  render() {
    const { me } = this.props;
    return (
      <AppWrapper>
        From Settings => {me.user.name} ({me.user.email})
      </AppWrapper>
    );
  }
}
