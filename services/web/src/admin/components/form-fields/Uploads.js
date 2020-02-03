import React from 'react';
import { Form, Message, Image, Icon, Label, Card } from 'semantic-ui-react';
import Dropzone from 'react-dropzone';
import request from 'utils/request';
import { urlForUpload } from 'utils/uploads';

export default class Uploads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      uploads: props.value ? props.value.slice() : []
    };
    props.onChange(this.state.uploads.map((upload) => upload.id));
  }

  delete(upload) {
    const { uploads } = this.state;
    const newUploads = uploads.filter((u) => u.id != upload.id);
    this.setState({ uploads: newUploads });
    this.props.onChange(newUploads.map((upload) => upload.id));
  }

  drop(acceptedFiles, rejectedFiles) {
    this.setState({ loading: true, error: null });
    const loading = false;
    let error = null;
    if (rejectedFiles.length) {
      error = new Error(`File did not meet criteria: ${rejectedFiles[0].name}`);
      return this.setState({ error, loading });
    }
    if (acceptedFiles.length > 1) {
      error = new Error('Oops, you can only upload 1 file at a time');
      return this.setState({ error, loading });
    }
    request({
      method: 'POST',
      path: '/1/uploads',
      file: acceptedFiles[0]
    })
      .then(({ data }) => {
        const { uploads } = this.state;
        uploads.push(data);
        this.setState({ uploads, loading });
        this.props.onChange(uploads.map((upload) => upload.id));
      })
      .catch((error) => {
        this.setState({ error, loading });
      });
  }

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
                      zIndex: 1
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
                  <Icon
                    name="delete"
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.delete(upload)}
                  />
                </Label>
              ))}
            </Label.Group>
          ))}
        <Dropzone
          maxSize={5 * 1024 * 1024}
          onDrop={(acceptedFiles, rejectedFiles) =>
            this.drop(acceptedFiles, rejectedFiles)
          }
        >
          {({ getRootProps, getInputProps, isDragActive }) => {
            return (
              <div
                {...getRootProps()}
                className={
                  isDragActive
                    ? 'ui icon blue message upload-dropzone-active'
                    : 'ui icon message upload-dropzone'
                }
                style={{ cursor: 'pointer', outline: 0 }}
              >
                {loading ? (
                  <Icon name="sync alternate" loading />
                ) : (
                  <Icon name={`file ${type} outline`} />
                )}
                <input {...getInputProps()} />
                <div className="content">
                  {loading ? (
                    <p>Uploading...</p>
                  ) : isDragActive ? (
                    <p>Drop files here...</p>
                  ) : (
                    <p>
                      Try dropping some files here, or click to select files to
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
}

Uploads.defaultProps = {
  type: 'image'
};
