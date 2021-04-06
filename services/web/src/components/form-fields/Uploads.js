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

const ALTERNATE_ICONS = {
  csv: 'excel',
  zip: 'archive',
};

export default class Uploads extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      uploads: [],
      loading: false,
      error: null,
    };
  }

  // Lifecycle

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      // Set the parent ids on mount so that it can submit later.
      // Do this on a timeout so that state conflicts don't occur.
      setTimeout(() => {
        this.setState({
          uploads: this.isMultiple(value) ? value : [value],
        });
      });
    }
  }

  componentDidUpdate(lastProps, lastState) {
    const { uploads } = this.state;
    if (uploads !== lastState.uploads) {
      const ids = uploads.map((u) => u.id);
      this.props.onChange({
        name: this.props.name,
        value: this.isMultiple() ? ids : ids[0],
      });
    }
  }

  componentWillUnmount() {
    // Workaround for component re-mounting with an array of
    // only ids... If we get unmounted here then reset to the
    // original upload objects.
    const { uploads } = this.state;
    if (uploads.length) {
      this.props.onChange({
        name: this.props.name,
        value: this.isMultiple() ? uploads : uploads[0],
      });
    }
  }

  // Events

  onDrop = async (acceptedFiles, rejectedFiles) => {
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
        uploads: [
          ...this.state.uploads,
          ...data,
        ],
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
      this.props.onError(error);
    }
  };

  // Helpers

  isMultiple(value = this.props.value) {
    return Array.isArray(value);
  }

  delete(upload) {
    const { uploads } = this.state;
    const newUploads = uploads.filter((u) => u.id != upload.id);
    this.setState({ uploads: newUploads });
  }

  render() {
    const { required, label, type } = this.props;
    const { error, loading, uploads } = this.state;
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        {error && <Message error content={error.message} />}
        {uploads.length > 0 &&
          (type === 'image' || type === 'video' || type === 'audio' ? (
            <Card.Group itemsPerRow={4}>
              {uploads.map((upload) => (
                <Card key={upload.id}>
                  {this.renderUpload(upload, type)}
                  <Icon
                    name="delete"
                    color="blue"
                    style={{
                      cursor: 'pointer',
                      position: 'absolute',
                      right: '5px',
                      top: '5px',
                      zIndex: 1,
                    }}
                    onClick={() => this.delete(upload)}
                  />
                  <Card.Content>{upload.filename}</Card.Content>
                </Card>
              ))}
            </Card.Group>
          ) : (
            <Label.Group color="blue">
              {uploads.map((upload) => (
                <Label key={upload.id}>
                  {this.renderIconForType()}
                  {upload.filename}
                  <Icon name="delete" style={{ cursor: 'pointer' }} onClick={() => this.delete(upload)} />
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
                  isDragActive ? 'ui icon blue message upload-dropzone-active' : 'ui icon message upload-dropzone'
                }
                style={{ cursor: 'pointer', outline: 0 }}>
                {loading ? <Icon name="sync alternate" loading /> : this.renderIconForType()}
                <input {...getInputProps()} />
                <div className="content">
                  {loading ? (
                    <p>Uploading...</p>
                  ) : isDragActive ? (
                    <p>Drop files here...</p>
                  ) : this.isMultiple() ? (
                    <p>Try dropping some files here, or click to select files to upload.</p>
                  ) : (
                    <p>Try dropping a file here, or click to select a file to upload.</p>
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
    const src = urlForUpload(upload, true);
    if (type === 'image') {
      return <Image key={upload.id} src={src} />;
    } else if (type === 'video') {
      return (
        <video
          style={{width: '100%'}}
          src={src}
          controls
        />
      );
    } else if (type === 'audio') {
      return (
        <audio src={src} controls />
      );
    }
  }

  renderIconForType() {
    const { type } = this.props;
    return <Icon name={`file-${ALTERNATE_ICONS[type] || type || ''} outline`} />;
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
