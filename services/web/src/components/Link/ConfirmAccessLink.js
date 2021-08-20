import React from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import { withSession } from 'stores';
import { omit } from 'lodash';

@withRouter
@withSession
export default class ConfirmAccessLink extends React.Component {
  handleOnClick = () => {
    if (
      Date.parse(this.context.user.accessConfirmedAt) >
      Date.now() - 5 * 60 * 1000
    ) {
      this.props.history.push(this.props.to);
    } else {
      this.props.history.push(`/confirm-access?to=${this.props.to}`);
    }
  };

  render() {
    return (
      <div onMouseDown={this.handleOnClick}>
        <NavLink {...omit(this.props, ['history', 'staticContext'])}>
          {this.props.children}
        </NavLink>
      </div>
    );
  }
}
