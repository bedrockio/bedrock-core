import React from 'react';
import Dropzone from 'react-dropzone';
import { request } from 'utils/api';

import {
  Modal,
  Icon,
  Progress,
  Table,
  Button,
  Message,
} from 'semantic-ui-react';
import { processFile } from 'utils/csv';

export const productsImportMapping = {
  name: {
    required: true,
    matches: ['name'],
    exactMatches: ['name', 'Name'],
  },
  description: {
    required: false,
    exactMatches: ['description', 'Description'],
  },
  expiresAt: {
    required: false,
    exactMatches: ['Expire Date'],
    type: 'datetime',
  },
  priceUsd: {
    required: true,
    exactMatches: ['Type', 'type'],
    defaultValue: 0,
    type: 'europeanOrAmericanNumber',
  },
};

async function batchCreate(objects, percentFn) {
  const errors = [];
  percentFn(1);
  let i = 0;
  for await (const object of objects) {
    try {
      await request({
        method: 'POST',
        path: '/1/products',
        body: object,
      });
    } catch (err) {
      errors.push(err);
    }
    percentFn((i / objects.length) * 100);
    i += 1;
  }
  percentFn(100);
  return errors;
}

export default class ImportProducts extends React.Component {
  state = this.getDefaultState();

  getDefaultState() {
    return {
      open: false,
      step: 1,
      loading: false,
      items: null,
      mapping: null,
      progressPercent: 0,
    };
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

    this.setState({ step: 2, loading: true });
    processFile(productsImportMapping, acceptedFiles[0])
      .then((result) => this.setState({ loading: false, ...result }))
      .catch((error) => this.setState({ loading: false, error }));
  }

  commit() {
    const { step, items } = this.state;
    this.setState({ step: step + 1, loading: true });
    batchCreate(items, (progressPercent) => this.setState({ progressPercent }))
      .then((errors) => this.setState({ loading: false, errors }))
      .catch((error) => this.setState({ loading: false, error }));
  }

  renderErrorSummary(errors) {
    const errorsByCount = {};
    errors.forEach((error) => {
      if (!errorsByCount[error.message]) {
        errorsByCount[error.message] = 0;
      }
      errorsByCount[error.message] += 1;
    });

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Error</Table.HeaderCell>
            <Table.HeaderCell>Occurrences</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.keys(errorsByCount).map((message, i) => {
            return (
              <Table.Row key={i}>
                <Table.Cell>{message}</Table.Cell>
                <Table.Cell>{errorsByCount[message]}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }

  renderCommit() {
    const { loading, progressPercent, error, errors, items } = this.state;
    return (
      <div>
        {error && <Message error content={error.message} />}
        {loading ? (
          <Progress
            label="Importing Data"
            percent={progressPercent}
            indicating
          />
        ) : errors && errors.length ? (
          <div>
            <p>
              Received {errors.length} errors while importing {items.length}{' '}
              records:
            </p>
            {this.renderErrorSummary(errors)}
          </div>
        ) : (
          <p>Imported {items.length} records successfully!</p>
        )}
      </div>
    );
  }

  renderPreview() {
    const { error, loading, items, mapping, numColumnsMatched } = this.state;
    return (
      <div>
        {error && <Message error content={error.message} />}
        {loading && (
          <Progress label="Analyzing Data" percent={100} indicating />
        )}
        {items && (
          <div>
            <p>
              Matched up {numColumnsMatched} columns over {items.length}{' '}
              records. Preview:
            </p>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  {Object.keys(mapping).map((key) => {
                    return <Table.HeaderCell key={key}>{key}</Table.HeaderCell>;
                  })}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.slice(0, 5).map((item, i) => {
                  return (
                    <Table.Row key={i}>
                      {Object.keys(mapping).map((key) => {
                        return <Table.Cell key={key}>{item[key]}</Table.Cell>;
                      })}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    );
  }

  renderUploadForm() {
    return (
      <Dropzone
        maxSize={5 * 1024 * 1024}
        onDrop={(acceptedFiles, rejectedFiles) =>
          this.drop(acceptedFiles, rejectedFiles)
        }>
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
              <Icon name="file outline" />
              <input {...getInputProps()} />
              <div className="content">
                {isDragActive ? (
                  <p>Drop files here...</p>
                ) : (
                  <p>
                    Drop a CSV file here, or click to select one for upload.
                  </p>
                )}
              </div>
            </div>
          );
        }}
      </Dropzone>
    );
  }

  onClose = () => {
    this.setState(this.getDefaultState());
    this.props.onClose();
  };

  render() {
    const { trigger } = this.props;
    const { open, step, loading } = this.state;
    return (
      <Modal
        closeIcon
        closeOnDimmerClick={false}
        trigger={trigger}
        onClose={this.onClose}
        onOpen={() => this.setState({ open: true })}
        open={open}>
        <Modal.Header>Import Products</Modal.Header>
        <Modal.Content>
          {step === 1 && this.renderUploadForm()}
          {step === 2 && this.renderPreview()}
          {step === 3 && this.renderCommit()}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content="Reset"
            icon="redo"
            disabled={step === 1 || step > 2}
            onClick={() => {
              this.setState({
                ...this.getDefaultState(),
                open: true,
              });
            }}
          />
          {step === 2 && (
            <Button
              content="Import"
              icon="checkmark"
              primary
              disabled={loading}
              onClick={() => {
                this.commit();
              }}
            />
          )}
          {step === 3 && (
            <Button
              content="Done"
              primary
              disabled={loading}
              loading={loading}
              onClick={() => {
                this.onClose();
              }}
            />
          )}
        </Modal.Actions>
      </Modal>
    );
  }
}
