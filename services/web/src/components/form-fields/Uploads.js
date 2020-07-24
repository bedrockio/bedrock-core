import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Form, Message, Image, Icon, Label, Card } from 'semantic-ui-react';
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
    const uploads = this.getInitialUploads(props);
    this.state = {
      loading: false,
      error: null,
      uploads,
    };
    this.onChange(uploads);
  }

  getInitialUploads(props) {
    const { value } = props;
    let uploads;
    if (!value) {
      uploads = [];
    } else if (Array.isArray(value)) {
      uploads = value.concat();
    } else {
      uploads = [value];
    }
    return uploads;
  }

  delete(upload) {
    const { uploads } = this.state;
    const newUploads = uploads.filter((u) => u.id != upload.id);
    this.setState({ uploads: newUploads });
    this.onChange(newUploads);
  }

  onChange = () => {
    const { single, onChange } = this.props;
    const { uploads } = this.state;
    if (single) {
      onChange(uploads[0] || null);
    } else {
      onChange(uploads);
    }
  }

  onDrop = async (acceptedFiles, rejectedFiles) => {
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const { single, type } = this.props;
      if (single) {
        acceptedFiles = acceptedFiles.slice(0, 1);
      }
      if (rejectedFiles.length) {
        throw new Error(`File must be of ${type} type.`);
      }
      const { data } = await request({
        method: 'POST',
        path: '/1/uploads',
        files: acceptedFiles,
      });
      const uploaded = Array.isArray(data) ? data : [data];
      const uploads = single ? uploaded : [...this.state.uploads, ...uploaded];
      this.setState({
        uploads,
        loading: false,
      });
      this.onChange(uploads);
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
      this.props.onError(error);
    }
  };

  render() {
    const { required, label, type, single } = this.props;
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
                  ) : single ? (
                    <p>Try dropping a file here, or click to select a file to upload.</p>
                  ) : (
                    <p>Try dropping some files here, or click to select files to upload.</p>
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
    if (type === 'image') {
      return <Image key={upload.id} src={urlForUpload(upload, true)} />;
    } else if (type === 'video') {
      return (
        <video
          style={{width: '100%'}}
          src={urlForUpload(upload, true)}
          controls
        />
      );
    } else if (type === 'audio') {
      return (
        <audio src={urlForUpload(upload, true)} controls />
      );
    }
  }

  renderIconForType() {
    const { type } = this.props;
    return <Icon name={`${ALTERNATE_ICONS[type] || type || ''} file outline`} />;
  }
}

Uploads.propTypes = {
  type: PropTypes.oneOf(Object.keys(MIME_TYPES)),
  single: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

Uploads.defaultProps = {
  type: 'image',
  single: false,
  onError: () => {},
};
