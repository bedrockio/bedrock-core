import React from 'react';
import { uniq } from 'lodash';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Form, Image, Icon, Label, Card } from 'semantic';
import { request } from 'utils/api';
import { urlForUpload } from 'utils/uploads';

const MIME_TYPES = {
  image: {
    mime: 'image/*',
    extensions: ['.jpg', '.jpeg', '.gif', '.svg', '.png'],
  },
  video: {
    mime: 'video/*',
    extensions: ['.mp4', '.mov'],
  },
  audio: {
    mime: 'audio/*',
    extensions: ['.mp3', '.ogg'],
  },
  text: {
    mime: 'text/*',
    extensions: ['.txt'],
  },
  pdf: {
    mime: 'application/pdf',
    extensions: ['.pdf'],
  },
  csv: {
    mime: 'text/csv,application/vnd.ms-excel',
    extensions: ['.csv'],
  },
  zip: {
    mime: 'application/zip,application/x-zip-compressed,application/octet-stream',
    extensions: ['.zip'],
  },
};

const MEDIA_TYPES = ['image', 'video', 'audio'];

const ICONS = {
  image: 'file-image',
  video: 'file-video',
  audio: 'file-audio',
  text: 'file-lines',
  pdf: 'file-pdf',
  csv: 'file-excel',
  zip: 'file-zipper',
};

export default class Uploads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
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
        const messages = rejectedFiles.flatMap((rejectedFile) => {
          return rejectedFile.errors.map((error) => {
            let { code, message } = error;
            if (code === 'file-invalid-type') {
              const types = this.getTypes();
              const formatted = new Intl.ListFormat('en', {
                style: 'short',
                type: 'disjunction',
              }).format(types);
              message = `File must be of ${formatted} type.`;
            }
            return message;
          });
        });
        const message = uniq(messages).join(' ');
        throw new Error(message);
      }
      this.setState({
        loading: true,
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

  getMediaStyles() {
    return {
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    };
  }

  // Type helpers

  getTypes() {
    return this.props.types || [this.props.type];
  }

  getTypeForUpload(upload) {
    let type;
    const types = this.getTypes();
    if (upload.mimeType) {
      const [base, subtype] = upload.mimeType.split('/');
      type = Object.keys(MIME_TYPES).find((key) => {
        return key === base || key === subtype;
      });
    }
    if (!type && types.length === 1) {
      type = types[0];
    }
    if (!type) {
      throw new Error(`Could not determine file type for ${upload}.`);
    }
    return type;
  }

  getMimeTypes() {
    const allowedTypes = {};
    for (let type of this.getTypes()) {
      const { mime, extensions } = MIME_TYPES[type];
      allowedTypes[mime] = extensions;
    }
    return allowedTypes;
  }

  hasMedia() {
    const types = this.getTypes();
    return types.some((type) => {
      return MEDIA_TYPES.includes(type);
    });
  }

  render() {
    const { required, label } = this.props;
    const { loading } = this.state;
    const uploads = this.getUploads();
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        {uploads.length > 0 &&
          (this.hasMedia() ? (
            <Card.Group itemsPerRow={4}>
              {uploads.map((upload) => (
                <Card
                  key={this.getUploadId(upload)}
                  className="upload-card"
                  >
                  {this.renderUpload(upload)}
                  <Icon
                    fitted
                    name="circle-xmark"
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
          accept={this.getMimeTypes()}
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
                  <Icon name="rotate" loading />
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

  renderUpload(upload) {
    const src = urlForUpload(upload);
    const type = this.getTypeForUpload(upload);
    if (type === 'image') {
      return <Image src={src} style={this.getMediaStyles()} />;
    } else if (type === 'video') {
      return <video src={src} style={this.getMediaStyles()} controls />;
    } else if (type === 'audio') {
      return <audio src={src} controls />;
    }
  }

  renderIconForType() {
    const { type } = this.props;
    return <Icon name={ICONS[type] || 'file'} />;
  }
}

Uploads.propTypes = {
  type: PropTypes.oneOf(Object.keys(MIME_TYPES)),
  types: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(MIME_TYPES))),
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

Uploads.defaultProps = {
  type: 'image',
  onError: () => {},
};
