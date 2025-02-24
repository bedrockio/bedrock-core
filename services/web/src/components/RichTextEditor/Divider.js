import { useClass } from 'helpers/bem';

import './divider.less';

export default function RichTextEditorDivider() {
  const { className } = useClass('rich-text-editor-divider');
  return <div className={className} />;
}
