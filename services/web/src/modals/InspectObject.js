import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { useState } from 'react';
import { PiCheck, PiCopy } from 'react-icons/pi';

import { Button } from '@/components/ui/button';

import ModalWrapper from 'components/ModalWrapper';

/**
 * InspectObject component for viewing JSON objects.
 *
 * @param {object} props
 * @param {object} props.object - The object to inspect.
 * @returns {JSX.Element}
 */
function InspectObject({ object }) {
  const [expandAll, setExpandAll] = useState(false);
  const [copied, setCopied] = useState(false);

  function onCopy() {
    navigator.clipboard.writeText(JSON.stringify(object, null, 2));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={expandAll}
            onChange={() => {
              setExpandAll(!expandAll);
            }}
          />
          Expand all
        </label>

        <Button
          variant="outline"
          size="icon"
          title={copied ? 'Copied' : 'Copy'}
          onClick={onCopy}>
          {copied ? <PiCheck size={16} /> : <PiCopy size={16} />}
        </Button>
      </div>
      <div className="max-h-[60vh] overflow-auto">
        <JsonView
          style={{
            ...darkTheme,
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
          }}
          value={object || {}}
          displayObjectSize={false}
          displayDataTypes={false}
          enableClipboard={false}
          collapsed={expandAll ? false : 3}
        />
      </div>
    </div>
  );
}

function Wrapper(props) {
  const { title, trigger, size = 'lg', object } = props;
  return (
    <ModalWrapper title={title} trigger={trigger} size={size}>
      <InspectObject object={object} />
    </ModalWrapper>
  );
}

export default Wrapper;
