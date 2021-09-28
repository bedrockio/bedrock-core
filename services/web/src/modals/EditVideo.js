import React from 'react';
import { Modal, Form, Header, Icon, Button, Divider, Message } from 'semantic';
import { request } from 'utils/api';
import AutoFocus from 'components/AutoFocus';
import { modal } from 'helpers';

import UploadsField from 'components/form-fields/Uploads';

@modal
export default class EditVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      video: props.video || {
        captions: [],
      },
    };
  }

  isUpdate() {
    return !!this.props.video;
  }

  setField = (evt, { name, value }) => {
    this.setState({
      video: {
        ...this.state.video,
        [name]: value,
      },
    });
  };

  setCaptionField = (index, name, value) => {
    let { captions } = this.state.video;
    captions = [
      ...captions.slice(0, index),
      { ...captions[index], [name]: value },
      ...captions.slice(index + 1),
    ];
    this.setState({
      video: {
        ...this.state.video,
        captions,
      },
    });
  };

  addCaption = () => {
    const { captions } = this.state.video;
    captions.push({
      kind: 'subtitles',
      language: 'en',
    });
    this.setState({
      video: {
        ...this.state.video,
        captions,
      },
    });
  };

  removeCaption = (index) => {
    const { captions } = this.state.video;
    this.setState({
      video: {
        ...this.state.video,
        captions: [...captions.slice(0, index), ...captions.slice(index + 1)],
      },
    });
  };

  setNumberField = (evt, { name, value }) => {
    this.setField(evt, { name, value: Number(value) });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
    });
    const { video } = this.state;

    try {
      if (this.isUpdate()) {
        await request({
          method: 'PATCH',
          path: `/1/videos/${video.id}`,
          body: video,
        });
      } else {
        await request({
          method: 'POST',
          path: '/1/videos',
          body: {
            ...video,
          },
        });
      }
      this.props.close();
      this.props.onSave();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { video, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>
          {this.isUpdate() ? `Edit "${video.name}"` : 'New Video'}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form
              noValidate
              id="edit-video"
              error={!!error}
              onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Form.Input
                required
                type="text"
                name="name"
                label="Name"
                value={video.name || ''}
                onChange={this.setField}
              />
              <UploadsField
                required
                type="video"
                name="upload"
                label="Upload"
                value={video.upload}
                onChange={this.setField}
                onError={(error) => this.setState({ error })}
                video
                gcs
              />
              {video.captions.map((caption, i) => {
                return (
                  <React.Fragment key={i}>
                    <Divider />
                    <Header icon="poo">
                      Caption {i + 1}{' '}
                      <span onClick={() => this.removeCaption(i)}>
                        <Icon name="close" link />
                      </span>
                    </Header>
                    <Form.Group>
                      <Form.Dropdown
                        selection
                        name="kind"
                        label="Kind"
                        value={caption.kind || ''}
                        options={[
                          {
                            text: 'Subtitles',
                            value: 'subtitles',
                          },
                          {
                            text: 'Captions',
                            value: 'captions',
                          },
                          {
                            text: 'Metadata',
                            value: 'metadata',
                          },
                        ]}
                        onChange={(evt, { name, value }) =>
                          this.setCaptionsField(i, name, value)
                        }
                      />
                      <Form.Dropdown
                        selection
                        name="language"
                        label="Language"
                        value={caption.kind || ''}
                        options={[
                          {
                            text: 'English',
                            value: 'en',
                          },
                          {
                            text: 'French',
                            value: 'fr',
                          },
                          {
                            text: 'German',
                            value: 'de',
                          },
                        ]}
                        onChange={(evt, { name, value }) =>
                          this.setCaptionsField(i, name, value)
                        }
                      />
                    </Form.Group>
                    <UploadsField
                      key={i}
                      required
                      type="video"
                      name="upload"
                      label="Upload"
                      value={video.upload}
                      onChange={(evt, { name, value }) =>
                        this.setCaptionsField(i, name, value)
                      }
                      onError={(error) => this.setState({ error })}
                      video
                    />
                  </React.Fragment>
                );
              })}
              <Button type="button" size="tiny" onClick={this.addCaption}>
                Add Caption
              </Button>
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            form="edit-video"
            loading={loading}
            disabled={loading}
            content={this.isUpdate() ? 'Update' : 'Create'}
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }
}
