import React from 'react';

import bem from 'helpers/bem';

import Button from '../Button';
import Divider from '../Divider';
import LinkButton from '../LinkButton';
import ImageButton from '../ImageButton';

import ModeMenu from './ModeMenu';
import BlockMenu from './BlockMenu';
import AlignmentMenu from './AlignmentMenu';

import './toolbar.less';

class RichTextEditorToolbar extends React.Component {
  onMouseDown = (evt) => {
    evt.preventDefault();
  };

  render() {
    const { children } = this.props;
    return (
      <div onMouseDown={this.onMouseDown} className={this.getBlockClass()}>
        {children || this.renderDefault()}
      </div>
    );
  }

  renderDefault() {
    const { mode } = this.context;
    return (
      <React.Fragment>
        <ModeMenu />
        {mode === 'inline' && (
          <React.Fragment>
            <Divider />
            <Button type="undo" />
            <Button type="redo" />
            <Divider />
            <BlockMenu />
            <Divider />
            <Button type="bold" />
            <Button type="italic" />
            <Button type="code" />
            <Divider />
            <LinkButton />
            <ImageButton />
            <AlignmentMenu />
            <Button type="ordered-list" />
            <Button type="unordered-list" />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

RichTextEditorToolbar.propTypes = {};

export default bem(RichTextEditorToolbar);
