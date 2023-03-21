import { startCase } from 'lodash';
import React from 'react';

import bem from 'helpers/bem';
import Markdown from 'components/Markdown';

import EditFieldModal from './EditFieldModal';
import { DocsContext } from '../utils/context';

import './editable-field.less';

@bem
export default class DocsEditableField extends React.Component {
  static contextType = DocsContext;

  getMode() {
    return this.context.mode;
  }

  getModifiers() {
    const mode = this.getMode();
    const { value } = this.props;
    return [mode === 'edit' ? 'editable' : null, value ? 'filled' : 'empty'];
  }

  render() {
    const mode = this.getMode();
    const { name } = this.props;
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
    const mode = this.getMode();
    const { value, markdown } = this.props;
    if (!value && mode === 'edit') {
      return <div className={this.getElementClass('prompt')}>{label}</div>;
    } else if (markdown) {
      return <Markdown source={value} />;
    } else if (value) {
      return value;
    }
  }
}
