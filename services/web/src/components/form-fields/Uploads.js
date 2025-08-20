import React from 'react';
import { uniq } from 'lodash';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';

import {
  Input,
  SimpleGrid,
  Image,
  Paper,
  Text,
  Pill,
  Loader,
} from '@mantine/core';

import { request } from 'utils/api';
import { urlForUpload } from 'utils/uploads';
import { IconFile, IconTrash } from '@tabler/icons-react';

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

export default class Uploads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  static defaultProps = {
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    },
    type: 'image',
  };

  // Events

  onDrop = async (acceptedFiles, rejectedFiles) => {
    const { value } = this.props;
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
        this.props.onChange([...value, ...data]);
      } else {
        this.props.onChange(data[0]);
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

  delete(upload) {
    const { value } = this.props;
    if (this.isMultiple()) {
      const removeId = this.getUploadId(upload);
      this.props.onChange(
        value.filter((obj) => {
          return this.getUploadId(obj) !== removeId;
        }),
      );
    } else {
      this.props.onChange(value);
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
      <Input.Wrapper label={label} required={required}>
        {uploads.length > 0 &&
          (this.hasMedia() ? (
            <SimpleGrid cols={4}>
              {uploads.map((upload) => (
                <Paper
                  style={{ position: 'relative' }}
                  shadow="xl"
                  key={this.getUploadId(upload)}
                  className="upload-card">
                  {this.renderUpload(upload)}
                  <IconTrash
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      cursor: 'pointer',
                    }}
                    size="14"
                    onClick={() => this.delete(upload)}
                  />
                  {upload.filename && (
                    <Text
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        color: '#fff',
                        padding: '4px 8px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        overflow: 'ellipsis',
                      }}>
                      {upload.filename}
                    </Text>
                  )}
                </Paper>
              ))}
            </SimpleGrid>
          ) : (
            <Paper color="blue">
              {uploads.map((upload) => (
                <Pill key={this.getUploadId(upload)}>
                  {this.renderIconForType()}
                  {upload.filename || 'File'}
                  <IconTrash
                    size={14}
                    style={{ cursor: 'pointer' }}
                    onClick={(evt) => this.delete(evt, upload)}
                  />
                </Pill>
              ))}
            </Paper>
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
                {loading && <Loader />}
                <input {...getInputProps()} />
                <Paper withBorder mt="md" p="md">
                  {loading ? (
                    <Text>Uploading...</Text>
                  ) : isDragActive ? (
                    <Text>Drop files here...</Text>
                  ) : this.isMultiple() ? (
                    <Text size="sm">
                      Try dropping some files here, or click to select files to
                      upload.
                    </Text>
                  ) : (
                    <Text size="sm">
                      Try dropping a file here, or click to select a file to
                      upload.
                    </Text>
                  )}
                </Paper>
              </div>
            );
          }}
        </Dropzone>
      </Input.Wrapper>
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
    return <IconFile />;
  }
}

Uploads.propTypes = {
  type: PropTypes.oneOf(Object.keys(MIME_TYPES)),
  types: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(MIME_TYPES))),
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};
