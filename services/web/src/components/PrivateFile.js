// Component for use with isPriivate uploads.

import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { Button } from 'semantic';

import { request } from 'utils/api';

import { ExternalLink } from './Link';

const ICONS = {
  image: 'file-image',
  video: 'file-video',
  audio: 'file-audio',
  text: 'file-lines',
  pdf: 'file-pdf',
  csv: 'file-excel',
  document: 'file-excel',
  application: 'file-pdf',
  zip: 'file-archive',
  'image/pdf': 'file-image',
};

export default class DownloadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
    };
  }

  componentDidMount() {
    this.load();
  }

  getIcon() {
    const { upload } = this.props;
    const [type] = upload.mimeType.split('/');
    return ICONS[type];
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
        url,
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
    const { upload } = this.props;
    if (!upload) {
      return null;
    }
    const { url } = this.state;
    const props = omit(this.props, Object.keys(DownloadButton.propTypes));

    return (
      <ExternalLink href={url}>
        <Button basic icon={this.getIcon()} {...props} />
      </ExternalLink>
    );
  }
}

DownloadButton.propTypes = {
  upload: PropTypes.object,
};
