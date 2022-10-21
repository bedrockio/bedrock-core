import React from 'react';

export default function () {
  return {
    blockRendererFn(block, { getEditorState }) {
      const type = block.getType();
      if (type === 'atomic') {
        const content = getEditorState().getCurrentContent();
        const entity = content.getEntity(block.getEntityAt(0));
        if (entity.getType() === 'TABLE') {
          const data = entity.getData();
          return {
            component: Table,
            editable: false,
            props: data,
          };
        }
      }
    },
  };
}

function Table(props) {
  const { head, body } = props.blockProps;
  return (
    <table>
      <thead>
        <tr>
          {head.map((header, i) => {
            return <th key={i}>{header}</th>;
          })}
        </tr>
        {body.map((row, i) => {
          return (
            <tr key={i}>
              {row.map((cell, j) => {
                return <td key={j}>{cell}</td>;
              })}
            </tr>
          );
        })}
      </thead>
    </table>
  );
}
