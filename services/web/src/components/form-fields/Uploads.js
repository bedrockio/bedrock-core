import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Form, Message, Image, Icon, Label, Card } from 'semantic';
import { request } from 'utils/api';
import { urlForUpload } from 'utils/uploads';

const MIME_TYPES = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  text: 'text/*',
  pdf: 'application/pdf',
  csv: 'text/csv,application/vnd.ms-excel',
  zip: 'application/zip,application/octet-stream',
};

const ICONS = {
  image: 'file-image',
  video: 'file-video',
  audio: 'file-audio',
  text: 'file-alt',
  pdf: 'file-pdf',
  csv: 'file-excel',
  zip: 'file-archive',
};

export default class Uploads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
    };
  }

  // Events

  onDrop = async (acceptedFiles, rejectedFiles, evt) => {
    const { name, value } = this.props;
    try {
      if (!this.isMultiple()) {
        acceptedFiles = acceptedFiles.slice(0, 1);
      }
      if (rejectedFiles.length) {
        throw new Error(`File must be of ${this.props.type} type.`);
      }
      this.setState({
        loading: true,
        error: null,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/uploads',
        files: acceptedFiles,
      });
      this.setState({
        loading: false,
      });

      if (this.isMultiple()) {
        this.props.onChange(evt, {
          name,
          value: [...value, ...data],
        });
      } else {
        this.props.onChange(evt, {
          name,
          value: data[0],
        });
      }
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
      this.props.onError(error);
    }
  };

  // Helpers

  getUploads() {
    const { value } = this.props;
    if (this.isMultiple()) {
      return value;
    } else {
      return value ? [value] : [];
    }
  }

  getUploadId(obj) {
    return obj.id || obj;
  }

  isMultiple() {
    return Array.isArray(this.props.value);
  }

  delete(evt, upload) {
    const { name, value } = this.props;
    if (this.isMultiple()) {
      const removeId = this.getUploadId(upload);
      this.props.onChange(evt, {
        name,
        value: value.filter((obj) => {
          return this.getUploadId(obj) !== removeId;
        }),
      });
    } else {
      this.props.onChange(evt, {
        name,
        value: null,
      });
    }
  }

  getVisualStyles() {
    return {
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    };
  }

  render() {
    const { required, label, type } = this.props;
    const { error, loading } = this.state;
    const uploads = this.getUploads();
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        {error && <Message error content={error.message} />}
        {uploads.length > 0 &&
          (type === 'image' || type === 'video' || type === 'audio' ? (
            <Card.Group itemsPerRow={4}>
              {uploads.map((upload) => (
                <Card key={this.getUploadId(upload)}>
                  {this.renderUpload(upload, type)}
                  <Icon
                    fitted
                    name="delete"
                    onClick={(evt) => this.delete(evt, upload)}
                  />
                  {upload.filename && (
                    <div className="caption">{upload.filename}</div>
                  )}
                </Card>
              ))}
            </Card.Group>
          ) : (
            <Label.Group color="blue">
              {uploads.map((upload) => (
                <Label key={this.getUploadId(upload)}>
                  {this.renderIconForType()}
                  {upload.filename || 'File'}
                  <Icon
                    name="delete"
                    style={{ cursor: 'pointer' }}
                    onClick={(evt) => this.delete(evt, upload)}
                  />
                </Label>
              ))}
            </Label.Group>
          ))}
        <Dropzone
          accept={MIME_TYPES[type]}
          maxSize={5 * 1024 * 1024}
          onDrop={this.onDrop}>
          {({ getRootProps, getInputProps, isDragActive }) => {
            return (
              <div
                {...getRootProps()}
                className={
                  isDragActive
                    ? 'ui icon blue message upload-dropzone-active'
                    : 'ui icon message upload-dropzone'
                }
                style={{ cursor: 'pointer', outline: 0 }}>
                {loading ? (
                  <Icon name="sync-alt" loading />
                ) : (
                  this.renderIconForType()
                )}
                <input {...getInputProps()} />
                <div className="content">
                  {loading ? (
                    <p>Uploading...</p>
                  ) : isDragActive ? (
                    <p>Drop files here...</p>
                  ) : this.isMultiple() ? (
                    <p>
                      Try dropping some files here, or click to select files to
                      upload.
                    </p>
                  ) : (
                    <p>
                      Try dropping a file here, or click to select a file to
                      upload.
                    </p>
                  )}
                </div>
              </div>
            );
          }}
        </Dropzone>
      </Form.Field>
    );
  }

  renderUpload(upload, type) {
    const src = urlForUpload(upload);
    if (type === 'image') {
      return <Image src={src} style={this.getVisualStyles()} />;
    } else if (type === 'video') {
      return <video src={src} style={this.getVisualStyles()} controls />;
    } else if (type === 'audio') {
      return <audio src={src} controls />;
    }
  }

  renderIconForType() {
    const { type } = this.props;
    return <Icon name={ICONS[type]} outline />;
  }
}

Uploads.propTypes = {
  type: PropTypes.oneOf(Object.keys(MIME_TYPES)),
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

Uploads.defaultProps = {
  type: 'image',
  onError: () => {},
};
