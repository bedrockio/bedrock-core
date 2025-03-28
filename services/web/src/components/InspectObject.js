import { CodeHighlight } from '@mantine/code-highlight';
import '@mantine/code-highlight/styles.css';

export default function InspectObject({ object }) {
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
