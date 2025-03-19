import { Dropdown } from 'semantic';

import InspectObject from 'components/InspectObject';
import Confirm from 'components/Confirm';

import { request } from 'utils/api';

export default function OrganizationActions(props) {
  const { organization, reload } = props;
  return (
    <Dropdown button basic text="More">
      <Dropdown.Menu direction="left">
        <InspectObject
          name="Organization"
          object={organization}
          trigger={<Dropdown.Item text="Inspect" icon="code" />}
        />
        <Confirm
          negative
          confirmButton="Delete"
          header={`Are you sure you want to delete "${organization.name}"?`}
          content="All data will be permanently deleted"
          trigger={<Dropdown.Item text="Delete" icon="trash" />}
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/organizations/${organization.id}`,
            });
            reload();
          }}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
