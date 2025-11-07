import { useSearch } from './Context';

export default function EmptyMessage(props) {
  const { children } = props;
  const { loading, items } = useSearch();

  if (loading || items.length) {
    return null;
  }

  return children;
}
