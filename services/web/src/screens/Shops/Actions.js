import React from 'react';

import { Dropdown, Confirm } from 'semantic';
import { request } from 'utils/api';

export default function ShopsActions({ item, reload } = {}) {
  return (
    <>
      <Confirm
        negative
        confirmButton="Delete"
        header={`Are you sure you want to delete "${item.name}"?`}
        content="All data will be permanently deleted"
        trigger={<Dropdown.Item text="Delete" icon="trash" />}
        onConfirm={async () => {
          await request({
            method: 'DELETE',
            path: `/1/shops/${item.id}`,
          });
          reload();
        }}
      />
    </>
  );
}
