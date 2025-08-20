import { useEffect, useState, useCallback } from 'react';
import { get } from 'lodash';
import { Button, Textarea, TextInput, Checkbox, Stack } from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';

export default function EditFieldModal(props) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateModel, setUpdateModel] = useState(false);
  const [value, setValue] = useState(props.value);

  // Determine if the value is shadowed (different from model)
  const isShadowedValue = useCallback(() => {
    const { docs, value, type, modelPath = [] } = props;
    const modelValue = get(docs, [...modelPath, type]);
    return (value || null) !== (modelValue || null);
  }, [props]);

  useEffect(() => {
    setUpdateModel(!isShadowedValue());
  }, []);

  function handleFieldChange(event) {
    setValue(event.currentTarget.value);
  }

  async function onSubmit(event) {
    if (event) event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { type, modelPath, path } = props;
      let updatePath;
      if (updateModel && modelPath) {
        updatePath = [...modelPath, type];
      } else {
        updatePath = [...path, type];
      }
      await props.updatePath(updatePath, value);
      setLoading(false);
      props.close();
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  function onKeyDown(evt) {
    const { key, metaKey } = evt;
    if (key === 'Enter' && metaKey) {
      onSubmit();
    }
  }

  function renderUpdateModel() {
    const { model } = props;
    if (model) {
      return (
        <Checkbox
          label={`Update base ${model.toLowerCase()}.`}
          checked={updateModel}
          onChange={(event) => setUpdateModel(event.currentTarget.checked)}
          mt="md"
        />
      );
    }
    return null;
  }

  return (
    <>
      <Stack>
        <form id="edit-docs-field" onSubmit={onSubmit}>
          <ErrorMessage error={error} />
          {props.markdown ? (
            <Textarea
              value={value || ''}
              onChange={handleFieldChange}
              onKeyDown={onKeyDown}
              autosize
              minRows={4}
              data-autofocus
              mt="sm"
            />
          ) : (
            <TextInput
              type="text"
              value={value || ''}
              onChange={handleFieldChange}
              onKeyDown={onKeyDown}
              data-autofocus
              mt="sm"
            />
          )}
          {renderUpdateModel()}
        </form>

        <Button
          type="submit"
          form="edit-docs-field"
          loading={loading}
          disabled={loading}>
          Save
        </Button>
      </Stack>
    </>
  );
}
