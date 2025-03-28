import { CodeHighlight } from '@mantine/code-highlight';
import '@mantine/code-highlight/styles.css';
import { Button } from '@mantine/core';

export default function InspectObject({ context, object, ...props }) {
  return (
    <>
      <CodeHighlight
        style={{
          borderRadius: 'var(--mantine-radius-md)',
        }}
        language="json"
        code={JSON.stringify(object || {}, null, 2)}
      />
    </>
  );
}
