import Code from 'components/Code';

export default function InspectObject({ object, ...props }) {
  return (
    <>
      <Code
        style={{
          borderRadius: 'var(--mantine-radius-md)',
        }}
        language="json"
        code={JSON.stringify(object || {}, null, 2)}
      />
    </>
  );
}
