import {
  ActionIcon,
  Checkbox,
  CopyButton,
  Group,
  Stack,
  Tooltip,
} from '@mantine/core';

import JsonView from '@uiw/react-json-view';
// eslint-disable-next-line
import { darkTheme } from '@uiw/react-json-view/dark';
import { useState } from 'react';
import { PiCheck, PiCopy } from 'react-icons/pi';

export default function InspectObject({ object }) {
  const [expandAll, setExpandAll] = useState(false);

  return (
    <Stack>
      <Group justify="space-between">
        <Checkbox
          label="Expand all"
          onChange={() => {
            setExpandAll(!expandAll);
          }}
        />

        <CopyButton value={JSON.stringify(object, null, 2)} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? 'Copied' : 'Copy'}
              withArrow
              position="bottom">
              <ActionIcon variant="default" onClick={copy}>
                {copied ? <PiCheck size={16} /> : <PiCopy size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      <JsonView
        style={{
          ...darkTheme,
          '--w-rjv-background-color':
            'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))',
          borderRadius: 'var(--mantine-radius-sm)',
          padding: 'var(--mantine-spacing-sm)',
        }}
        value={object || {}}
        displayObjectSize={false}
        displayDataTypes={false}
        enableClipboard={false}
        collapsed={expandAll ? false : 3}
      />
    </Stack>
  );
}
