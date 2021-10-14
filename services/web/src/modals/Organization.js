import React from 'react';
import { Modal } from 'semantic';
import { withSession } from 'stores';
import { request } from 'utils/api';
import { userHasAccess } from 'utils/permissions';
import SearchDropdown from 'components/SearchDropdown';
import modal from 'helpers/modal';

@modal
@withSession
export default class OrganizationSelector extends React.Component {
  fetchOrganizations = async (keyword) => {
    const { user } = this.context;
    if (
      userHasAccess(user, {
        endpoint: 'organizations',
        permission: 'read',
        scope: 'global',
      })
    ) {
      const { data } = await request({
        method: 'POST',
        path: '/1/organizations/search',
        body: {
          keyword,
        },
      });
      return data;
    } else {
      const { data } = await request({
        method: 'POST',
        path: '/1/organizations/mine/search',
        body: {
          keyword,
        },
      });
      return data;
    }
  };

  onChange = (evt, { value }) => {
    this.context.setOrganization(value);
    this.props.close();
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
            value={this.context.getOrganization()}
            onDataNeeded={this.fetchOrganizations}
            onChange={this.onChange}
          />
        </Modal.Content>
      </React.Fragment>
    );
  }
}
