import { Dropdown } from 'semantic';

import InspectObject from 'modals/InspectObject';
import EditTemplate from 'modals/EditTemplate';
import Confirm from 'components/Confirm';

import { request } from 'utils/api';

export default function TemplatesActions(props) {
  const { template, reload } = props;
  return (
    <Dropdown button basic text="More">
      <Dropdown.Menu direction="left">
        <InspectObject
          name="Template"
          object={template}
          trigger={<Dropdown.Item text="Inspect" icon="code" />}
        />
        <EditTemplate
          template={template}
          trigger={<Dropdown.Item text="Edit" icon="pen-to-square" />}
        />
        <Confirm
          negative
          confirmButton="Delete"
          header={`Are you sure you want to delete "${template.name}"?`}
          content="All data will be permanently deleted"
          trigger={<Dropdown.Item text="Delete" icon="trash" />}
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/templates/${template.id}`,
            });
            reload();
          }}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
