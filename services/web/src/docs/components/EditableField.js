import { useContext } from 'react';
import PropTypes from 'prop-types';
import { get, startCase } from 'lodash';
import { Text } from '@mantine/core';
import { useClass } from 'helpers/bem';

import Markdown from 'components/Markdown';
import ModalWrapper from 'components/ModalWrapper';

import EditFieldModal from './EditFieldModal';
import { useDocs } from '../utils/context';
import { DocsContext } from '../utils/context';

import './editable-field.less';

export default function DocsEditableField(props) {
  const { type, path, onClick, modelPath } = props;
  const context = useContext(DocsContext);

  const { mode, docs } = useDocs();

  const { className, getElementClass } = useClass(
    'docs-editable-field',
    ...getModifiers(),
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

  function renderModalContent({ close }) {
    return (
      <EditFieldModal
        {...props}
        docs={docs}
        updatePath={context.updatePath}
        value={getValue()}
        label={`Edit ${startCase(type)}`}
        close={close}
      />
    );
  }

  function render() {
    if (mode === 'edit') {
      return (
        <ModalWrapper
          title={[
            `Edit ${startCase(type)}`,
            props.markdown && ' - Supports Markdown',
          ].filter(Boolean)}
          component={renderModalContent}
          trigger={<Text className={className}>{renderValue()}</Text>}
        />
      );
    } else {
      return (
        <div className={className} onClick={onClick}>
          {renderValue()}
        </div>
      );
    }
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
