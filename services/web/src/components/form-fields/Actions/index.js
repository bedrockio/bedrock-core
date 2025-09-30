import { useClass } from 'helpers/bem';

import './actions.less';

export default function Actions(props) {
  const { className } = useClass('form-actions');

  return <div className={className}>{props.children}</div>;
}
