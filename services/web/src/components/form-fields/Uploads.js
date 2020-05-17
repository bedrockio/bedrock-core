import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Form, Message, Image, Icon, Label, Card } from 'semantic-ui-react';
import { request } from 'utils/api';
import { urlForUpload } from 'utils/uploads';

export default class Uploads extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      uploads: props.value ? props.value.slice() : [],
    };
    props.onChange(this.state.uploads.map((upload) => upload.id));
  }

  delete(upload) {
    const { uploads } = this.state;
    const newUploads = uploads.filter((u) => u.id != upload.id);
    this.setState({ uploads: newUploads });
    this.props.onChange(newUploads.map((upload) => upload.id));
  }

  onDrop = async (acceptedFiles, rejectedFiles) => {
    this.setState({
      loading: true,
      error: null,
    });
    try {
      if (rejectedFiles.length) {
        throw new Error(`File did not meet criteria: ${rejectedFiles[0].file.name}`);
      }
      const { data } = await request({
        method: 'POST',
        path: '/1/uploads',
        files: acceptedFiles,
      });
      const uploads = [...this.state.uploads, ...data];
      this.setState({
        uploads,
        loading: false,
      });
      this.props.onChange(uploads.map((upload) => upload.id));
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
      this.props.onError(error);
    }
  };

  render() {
    const { required, label, type } = this.props;
    const { error, loading, uploads } = this.state;
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        {error && <Message error content={error.message} />}
        {uploads.length > 0 &&
          (type === 'image' ? (
            <Card.Group itemsPerRow={4}>
              {uploads.map((upload) => (
                <Card key={upload.id}>
                  <Image key={upload.id} src={urlForUpload(upload, true)} />
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
                  <Icon name={`${type} file outline`} />
                  {upload.filename}
                  <Icon name="delete" style={{ cursor: 'pointer' }} onClick={() => this.delete(upload)} />
                </Label>
              ))}
            </Label.Group>
          ))}
        <Dropzone maxSize={5 * 1024 * 1024} onDrop={this.onDrop}>
          {({ getRootProps, getInputProps, isDragActive }) => {
            return (
              <div
                {...getRootProps()}
                className={
                  isDragActive ? 'ui icon blue message upload-dropzone-active' : 'ui icon message upload-dropzone'
                }
                style={{ cursor: 'pointer', outline: 0 }}>
                {loading ? <Icon name="sync alternate" loading /> : <Icon name={`file ${type} outline`} />}
                <input {...getInputProps()} />
                <div className="content">
                  {loading ? (
                    <p>Uploading...</p>
                  ) : isDragActive ? (
                    <p>Drop files here...</p>
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
}

Uploads.propTypes = {
  type: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
}

Uploads.defaultProps = {
  type: 'image',
  onError: () => {},
};
