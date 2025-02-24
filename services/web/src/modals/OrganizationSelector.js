import React from 'react';
import { Modal } from 'semantic';

import { withSession } from 'stores/session';

import modal from 'helpers/modal';

import SearchDropdown from 'components/SearchDropdown';

import { request } from 'utils/api';
import { userHasAccess } from 'utils/permissions';
import { getOrganization, setOrganization } from 'utils/organization';

class OrganizationSelector extends React.Component {
  fetchOrganizations = async (body) => {
    const { user } = this.context;
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

  onChange = (evt, { value }) => {
    this.props.close();
    setOrganization(value.id);
  };

  render() {
    return (
      <React.Fragment>
        <Modal.Header>Select Organization</Modal.Header>
        <Modal.Content>
          <SearchDropdown
            fluid
            clearable
            placeholder="Viewing all organizations"
            value={getOrganization()}
            onDataNeeded={this.fetchOrganizations}
            onChange={this.onChange}
          />
        </Modal.Content>
      </React.Fragment>
    );
  }
}

export default modal(withSession(OrganizationSelector));
