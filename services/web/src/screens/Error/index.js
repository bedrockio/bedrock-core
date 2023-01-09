import React from 'react';
import PropTypes from 'prop-types';
import { Message, Button } from 'semantic';

import { withSession } from 'stores';
import screen from 'helpers/screen';
import { ENV_NAME } from 'utils/env';

@screen
@withSession
export default class ErrorScreen extends React.Component {
  static layout = 'basic';

  onLogoutClick = async () => {
    await this.context.logout(true);
  };

  onReloadClick = () => {
    window.location.reload();
  };

  render() {
    const { title } = this.props;
    return (
      <div>
        <Message error header={title} content={this.renderErrorBody()} />
        <div>
          <Button size="small" onClick={this.onLogoutClick} primary>
            Logout
          </Button>
        </div>
      </div>
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
