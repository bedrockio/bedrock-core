import React from 'react';
import PropTypes from 'prop-types';
import { Message, Button } from 'semantic';

import { withSession } from 'stores/session';

import screen from 'helpers/screen';
import BasicLayout from 'layouts/Basic';

import { ENV_NAME } from 'utils/env';

class ErrorScreen extends React.Component {
  onLogoutClick = async () => {
    await this.context.logout(true);
  };

  onReloadClick = () => {
    window.location.reload();
  };

  render() {
    const { title } = this.props;
    return (
      <BasicLayout>
        <Message error header={title} content={this.renderErrorBody()} />
        <div>
          <Button size="small" onClick={this.onLogoutClick} primary>
            Logout
          </Button>
        </div>
      </BasicLayout>
    );
  }

  renderErrorBody() {
    const { error } = this.props;
    if (ENV_NAME === 'production') {
      if (error.status >= 500) {
        return (
          <p>
            Our site seems to be having issues. Please wait a bit and{' '}
            {this.renderReloadLink('reload')} the page.
          </p>
        );
      } else {
        return (
          <p>We're looking into the issue. {this.renderReloadLink('reload')}</p>
        );
      }
    } else {
      return error.message;
    }
  }

  renderReloadLink(text) {
    return (
      <span className="link" onClick={this.onReloadClick}>
        {text}
      </span>
    );
  }
}

ErrorScreen.propTypes = {
  title: PropTypes.string.isRequired,
  error: PropTypes.object.isRequired,
};

ErrorScreen.defaultProps = {
  title: 'Something went wrong',
};

export default screen(withSession(ErrorScreen));
