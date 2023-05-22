import React from 'react';
import { get, startCase } from 'lodash';

import bem from 'helpers/bem';
import Markdown from 'components/Markdown';

import EditFieldModal from './EditFieldModal';
import { DocsContext } from '../utils/context';

import './editable-field.less';

@bem
export default class DocsEditableField extends React.Component {
  static contextType = DocsContext;

  getValue() {
    const { docs } = this.context;
    const { type, name, path, model } = this.props;
    let value = get(docs, [...path, name, type]);
    if (!value && model) {
      value = get(docs, [
        'components',
        'schemas',
        model,
        'properties',
        name,
        type,
      ]);
    }
    return value;
  }

  getMode() {
    return this.context.mode;
  }

  getModifiers() {
    const mode = this.getMode();
    const value = this.getValue();
    return [mode === 'edit' ? 'editable' : null, value ? 'filled' : 'empty'];
  }

  render() {
    const mode = this.getMode();
    const value = this.getValue();
    const { name } = this.props;
    const label = startCase(name);
    if (mode === 'edit') {
      return (
        <EditFieldModal
          {...this.props}
          value={value}
          label={label}
          trigger={this.renderTrigger(label)}
        />
      );
    } else {
      return this.renderTrigger(label);
    }
  }

  renderTrigger(label) {
    return (
      <div className={this.getBlockClass()}>{this.renderValue(label)}</div>
    );
  }

  renderValue(label) {
    const { markdown } = this.props;
    const mode = this.getMode();
    const value = this.getValue();
    if (!value && mode === 'edit') {
      return <div className={this.getElementClass('prompt')}>{label}</div>;
    } else if (markdown) {
      return <Markdown source={value} />;
    } else if (value) {
      return value;
    }
  }
}

DocsEditableField.defaultProps = {
  type: 'description',
};
