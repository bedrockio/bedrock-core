import React from 'react';

import bem from 'helpers/bem';

import './divider.less';

@bem
export default class RichTextEditorDivider extends React.Component {
  render() {
    return <div className={this.getBlockClass()} />;
  }
}
