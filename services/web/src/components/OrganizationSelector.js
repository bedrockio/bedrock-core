import { useSession } from 'stores/session';

import SearchDropdown from 'components/SearchDropdown';

import { request } from 'utils/api';
import { getOrganization, setOrganization } from 'utils/organization';
import { userHasAccess } from 'utils/permissions';

export default function OrganizationSelector() {
  const { user } = useSession();

  const fetchOrganizations = async (body) => {
    const hasGlobal = userHasAccess(user, {
      endpoint: 'organizations',
      permission: 'read',
      scope: 'global',
    });
    if (hasGlobal) {
      const { data } = await request({
        method: 'POST',
        path: '/1/organizations/search',
        body,
      });
      return data;
    } else {
      const { data } = await request({
        method: 'POST',
        path: '/1/organizations/mine/search',
        body,
      });
      return data;
    }
  };

  return (
    <SearchDropdown
      fluid
      placeholder="Viewing all organizations"
      value={getOrganization()}
      onDataNeeded={fetchOrganizations}
      onChange={(organization) => setOrganization(organization.id)}
    />
  );
}
