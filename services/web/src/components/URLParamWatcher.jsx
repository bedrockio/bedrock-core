import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class URLParamWatcher extends React.Component {
  constructor(props) {
    super(props);
    this.lastParams = null;
  }

  componentDidMount() {
    this.detach = this.props.history.listen(this.parse);
    this.parse();
  }

  componentWillUnmount() {
    this.detach();
  }

  getWatched() {
    const { param, params } = this.props;
    return params || [param];
  }

  hasChanged(params) {
    if (!this.lastParams) {
      return true;
    } else {
      return this.getWatched().some((name) => {
        return this.lastParams[name] !== params[name];
      });
    }
  }

  parse = () => {
    const params = Object.fromEntries(
      new URLSearchParams(this.props.history.location.search)
    );

    if (this.hasChanged(params)) {
      this.props.onChange(params);
      this.lastParams = params;
    }
  };

  render() {
    return null;
  }
}

URLParamWatcher.propTypes = {
  param: PropTypes.string,
  params: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};

URLParamWatcher.defaultProps = {
  onChange: () => {},
};

export default withRouter(URLParamWatcher);
