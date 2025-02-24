import PropTypes from 'prop-types';
import { get, startCase } from 'lodash';

import { useClass } from 'helpers/bem';

import Markdown from 'components/Markdown';

import EditFieldModal from './EditFieldModal';
import { useDocs } from '../utils/context';

import './editable-field.less';

export default function DocsEditableField(props) {
  const { type, path, onClick, modelPath } = props;

  const { mode, docs } = useDocs();

  const { className, getElementClass } = useClass(
    'docs-editable-field',
    ...getModifiers()
  );

  function getValue() {
    let value = get(docs, [...path, type]);
    if (!value && modelPath) {
      value = get(docs, [...modelPath, type]);
    }
    return value;
  }

  function allowsMarkdown() {
    return type === 'description';
  }

  function getModifiers() {
    const value = getValue();
    return [mode === 'edit' ? 'editable' : null, value ? 'filled' : 'empty'];
  }

  function render() {
    const value = getValue();
    const label = `Edit ${startCase(type)}`;
    if (mode === 'edit') {
      return (
        <EditFieldModal
          {...props}
          value={value}
          label={label}
          trigger={renderTrigger()}
        />
      );
    } else {
      return renderTrigger();
    }
  }

  function renderTrigger() {
    return (
      <div className={className} onClick={onClick}>
        {renderValue()}
      </div>
    );
  }

  function renderValue() {
    const value = getValue();
    if (!value && mode === 'edit') {
      return <div className={getElementClass('prompt')}>{type}</div>;
    } else if (allowsMarkdown()) {
      return <Markdown source={value} />;
    } else if (value) {
      return value;
    }
  }

  return render();
}

DocsEditableField.propTypes = {
  path: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['title', 'summary', 'description']).isRequired,
  modelPath: PropTypes.array,
  model: PropTypes.string,
};
