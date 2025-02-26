import DocsProperties from './Properties';

export default function Resource(props) {
  const { name } = props;
  return (
    <DocsProperties path={['components', 'schemas', name, 'properties']} />
  );
}
