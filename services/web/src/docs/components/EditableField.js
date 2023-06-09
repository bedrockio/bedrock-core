import React from 'react';
import PropTypes from 'prop-types';
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
    const { type, path, modelPath } = this.props;
    let value = get(docs, [...path, type]);
    if (!value && modelPath) {
      value = get(docs, [...modelPath, type]);
    }
    return value;
  }

  allowsMarkdown() {
    return this.props.type === 'description';
  }

  getModifiers() {
    const { mode } = this.context;
    const value = this.getValue();
    return [mode === 'edit' ? 'editable' : null, value ? 'filled' : 'empty'];
  }

  render() {
    const { mode } = this.context;
    const { type } = this.props;
    const value = this.getValue();
    const label = `Edit ${startCase(type)}`;
    if (mode === 'edit') {
      return (
        <EditFieldModal
          {...this.props}
          value={value}
          label={label}
          trigger={this.renderTrigger()}
        />
      );
    } else {
      return this.renderTrigger();
    }
  }

  renderTrigger() {
    const { onClick } = this.props;
    return (
      <div className={this.getBlockClass()} onClick={onClick}>
        {this.renderValue()}
      </div>
    );
  }

  renderValue() {
    const { mode } = this.context;
    const { type } = this.props;
    const value = this.getValue();
    if (!value && mode === 'edit') {
      return <div className={this.getElementClass('prompt')}>{type}</div>;
    } else if (this.allowsMarkdown()) {
      return <Markdown source={value} />;
    } else if (value) {
      return value;
    }
  }
}

DocsEditableField.propTypes = {
  path: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['title', 'summary', 'description']).isRequired,
  modelPath: PropTypes.array,
  model: PropTypes.string,
};
