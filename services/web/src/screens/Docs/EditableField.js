import { startCase } from 'lodash';
import React from 'react';

import bem from 'helpers/bem';

import EditFieldModal from './EditFieldModal';

import './editable-field.less';

import Markdown from 'components/Markdown';

@bem
export default class DocsEditableField extends React.Component {
  getModifiers() {
    const { mode, value } = this.props;
    return [mode === 'edit' ? 'editable' : null, value ? null : 'empty'];
  }

  render() {
    const { mode, name } = this.props;
    const label = startCase(name);
    if (mode === 'edit') {
      return (
        <EditFieldModal
          {...this.props}
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
    const { mode, value, markdown } = this.props;
    if (!value && mode === 'edit') {
      return <div className={this.getElementClass('prompt')}>{label}</div>;
    } else if (markdown) {
      return <Markdown source={value} />;
    } else if (value) {
      return value;
    }
  }
}
