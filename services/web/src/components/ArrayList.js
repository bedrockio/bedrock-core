import { get } from 'lodash-es';

export default function ArrayList(props) {
  const { array = [], field, fallback = '' } = props;

  if (!array.length) {
    return fallback;
  }

  return (
    <ul>
      {array.map((el, i) => {
        const value = field ? get(el, field) : el;
        return <li key={i}>{value}</li>;
      })}
    </ul>
  );
}
