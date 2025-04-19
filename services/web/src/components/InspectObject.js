import Code from 'components/Code';

export default function InspectObject({ object, ...props }) {
  return (
    <>
      <Code language="json" code={JSON.stringify(object || {}, null, 2)} />
    </>
  );
}
