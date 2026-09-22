import { get } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import ErrorMessage from 'components/ErrorMessage';
import { useModalContext } from 'components/ModalWrapper';

export default function EditFieldModal(props) {
  const { close } = useModalContext();

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
      close();
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
        <Label className="mt-4">
          <Checkbox
            checked={updateModel}
            onCheckedChange={(checked) => setUpdateModel(checked === true)}
          />
          {`Update base ${model.toLowerCase()}.`}
        </Label>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <form id="edit-docs-field" onSubmit={onSubmit}>
        <ErrorMessage error={error} />
        {props.markdown ? (
          <Textarea
            value={value || ''}
            onChange={handleFieldChange}
            onKeyDown={onKeyDown}
            rows={4}
            autoFocus
            className="mt-2"
          />
        ) : (
          <Input
            type="text"
            value={value || ''}
            onChange={handleFieldChange}
            onKeyDown={onKeyDown}
            autoFocus
            className="mt-2"
          />
        )}
        {renderUpdateModel()}
      </form>

      <Button type="submit" form="edit-docs-field" disabled={loading}>
        {loading && <Spinner />}
        Save
      </Button>
    </div>
  );
}
