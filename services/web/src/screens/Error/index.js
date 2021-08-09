import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Message } from 'semantic';
import { screen } from 'helpers';
import PageCenter from 'components/PageCenter';

@screen
export default class ErrorScreen extends React.Component {
  static layout = 'none';

  render() {
    const { title, error } = this.props;
    return (
      <PageCenter maxWidth="400px">
        <Message error header={title} content={error.message} />
        <Link to="/logout">Logout</Link>
      </PageCenter>
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
