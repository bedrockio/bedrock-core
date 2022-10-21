import React from 'react';

import { Dropdown } from '/semantic';
import { request } from '/utils/api';
import InspectObject from '/modals/InspectObject';
import { Confirm } from '/components';

export default function UserActions({ item, reload } = {}) {
  return (
    <Dropdown button basic text="More">
      <Dropdown.Menu direction="left">
        <InspectObject
          name="Shop"
          object={item}
          trigger={<Dropdown.Item text="Inspect" icon="code" />}
        />
        <Confirm
          negative
          confirmButton="Delete"
          header={`Are you sure you want to delete "${item.name}"?`}
          content="All data will be permanently deleted"
          trigger={<Dropdown.Item text="Delete" icon="trash" />}
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/users/${item.id}`,
            });
            reload();
          }}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
