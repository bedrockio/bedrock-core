import React from 'react';

import { useClass } from 'helpers/bem';

import { useRichTextEditor } from '../context';

import Button from '../Button';
import Divider from '../Divider';
import LinkButton from '../LinkButton';
import ImageButton from '../ImageButton';

import ModeMenu from './ModeMenu';
import BlockMenu from './BlockMenu';
import AlignmentMenu from './AlignmentMenu';

import './toolbar.less';

export default function RichTextEditorToolbar(props) {
  const { children } = props;

  const { className } = useClass('rich-text-editor-toolbar');
  const { mode } = useRichTextEditor();

  function onMouseDown(evt) {
    evt.preventDefault();
  }

  function render() {
    return (
      <div onMouseDown={onMouseDown} className={className}>
        {children || renderDefault()}
      </div>
    );
  }

  function renderDefault() {
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

  return render();
}
