import React from 'react';
import { get } from 'lodash';
import { Button, Form, Modal, Icon } from 'semantic';

import modal from 'helpers/modal';

import AutoFocus from 'components/AutoFocus';

import ErrorMessage from 'components/ErrorMessage';
import { HelpTip } from 'components';

import { DocsContext } from '../utils/context';

@modal
export default class EditFieldModal extends React.Component {
  static contextType = DocsContext;

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      updateModel: false,
      value: props.value,
    };
  }

  componentDidMount() {
    this.setState({
      updateModel: !this.isShadowedValue(),
    });
  }

  isShadowedValue() {
    const { docs } = this.context;
    const { value, type, modelPath = [] } = this.props;
    const modelValue = get(docs, [...modelPath, type]);
    // undefined, null, and empty strings are all considered equal here
    return (value || null) !== (modelValue || null);
  }

  setField = (evt, { value }) => {
    this.setState({
      value,
    });
  };

  onSubmit = async () => {
    this.setState({
      loading: true,
    });
    try {
      const { type, modelPath } = this.props;
      const { value, updateModel } = this.state;

      let path;
      if (updateModel && modelPath) {
        path = [...modelPath, type];
      } else {
        path = [...this.props.path, type];
      }
      await this.context.updatePath(path, value);
      this.setState({
        loading: false,
      });
      this.props.close();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onKeyDown = (evt) => {
    const { key, metaKey } = evt;
    if (key === 'Enter' && metaKey) {
      this.onSubmit();
    }
  };

  render() {
    const { label, markdown } = this.props;
    const { value, loading, error } = this.state;
    return (
      <React.Fragment>
        <Modal.Header>
          {label}
          {markdown && (
            <HelpTip
              icon={
                <Icon
                  size="large"
                  name="brands markdown"
                  style={{ color: '#666' }}
                  fitted
                />
              }
              text="Supports Markdown"
            />
          )}
        </Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form id="edit-docs-field" error={!!error} onSubmit={this.onSubmit}>
              <ErrorMessage error={error} />
              {markdown ? (
                <Form.TextArea
                  value={value || ''}
                  onChange={this.setField}
                  onKeyDown={this.onKeyDown}
                />
              ) : (
                <Form.Input
                  type="text"
                  value={value || ''}
                  onChange={this.setField}
                />
              )}
              {this.renderUpdateModel()}
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            content="Save"
            form="edit-docs-field"
            loading={loading}
            disabled={loading}
          />
        </Modal.Actions>
      </React.Fragment>
    );
  }

  renderUpdateModel() {
    const { model } = this.props;
    if (model) {
      const { updateModel } = this.state;
      return (
        <Form.Checkbox
          label={`Update base ${model.toLowerCase()}.`}
          checked={updateModel}
          onChange={(evt, { checked }) => {
            this.setState({
              updateModel: checked,
            });
          }}
        />
      );
    }
  }
}
