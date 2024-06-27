// Component for use with private uploads.

import React from 'react';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Image } from 'semantic';

import { request } from 'utils/api';

import { ExternalLink } from './Link';

export default class PrivateImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  load = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { upload } = this.props;

      const id = upload?.id || upload;

      const { data: url } = await request({
        method: 'GET',
        path: `/1/uploads/${id}/url`,
      });

      this.setState({
        src: url,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { src } = this.state;
    const props = omit(this.props, PrivateImage.propTypes);
    return (
      <ExternalLink href={src}>
        <Image {...props} src={src} />
      </ExternalLink>
    );
  }
}

PrivateImage.propTypes = {
  upload: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  filename: PropTypes.string,
};
