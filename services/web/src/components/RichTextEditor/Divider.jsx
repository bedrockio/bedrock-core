import React from 'react';
import bem from '/helpers/bem';

import './divider.less';

class RichTextEditorDivider extends React.Component {
  render() {
    return <div className={this.getBlockClass()} />;
  }
}

export default bem(RichTextEditorDivider);
