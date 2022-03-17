import React from 'react';
import { union } from 'lodash';
import { request } from 'utils/api';
import { Form, Loader, Popup, Icon, Modal, Button } from 'semantic';

import SearchDropdown from 'components/SearchDropdown';
import ErrorMessage from 'components/ErrorMessage';
import FetchObject from 'components/FetchObject';

export default class Roles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allRoles: null,
      allOrganizations: null,
      error: null,
      loading: true,
      roles: props.value,
      scopedOrganizationIds: this.getScopeRefs(props.value, 'organization'),
      showAddOrganizationModal: false,
    };
  }

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    request({
      method: 'GET',
      path: `/1/users/roles`,
    })
      .then(({ data }) => {
        const allRoles = data;
        this.setState({ allRoles, loading: false });
      })
      .catch((error) => {
        this.setState({ error, loading: false });
      });
  }

  setGlobalValues(values) {
    const otherRoles = this.state.roles.filter(
      (role) => role.scope !== 'global'
    );
    const roles = otherRoles.concat(
      values.map((value) => {
        return {
          scope: 'global',
          role: value,
        };
      })
    );
    this.setState({
      roles,
    });
    this.props.onChange(undefined, { value: roles });
  }

  getGlobalValues() {
    return this.state.roles
      .filter((role) => role.scope === 'global')
      .map((role) => role.role);
  }

  getScopedValues(scope, scopeRef) {
    return this.state.roles
      .filter((role) => role.scope === scope && role.scopeRef === scopeRef)
      .map((role) => role.role);
  }

  setScopedValues(scope, scopeRef, values) {
    const otherRoles = this.state.roles.filter(
      (role) => !(role.scope === scope && role.scopeRef === scopeRef)
    );
    const roles = otherRoles.concat(
      values.map((value) => {
        return {
          scope,
          scopeRef,
          role: value,
        };
      })
    );
    this.setState({
      roles,
    });
    this.props.onChange(undefined, { value: roles });
  }

  getScopeRefs(roles, scope) {
    return union(
      roles.filter((role) => role.scope === scope).map((role) => role.scopeRef)
    );
  }

  fetchOrganizations = async () => {
    const { data } = await request({
      method: 'POST',
      path: '/1/organizations/search',
      body: {},
    });
    return data;
  };

  addOrganizationScope() {
    const { currentOrganization, scopedOrganizationIds } = this.state;
    scopedOrganizationIds.push(currentOrganization.id);
    this.setState({ scopedOrganizationIds });
  }

  getOptionsForScope(scope) {
    const { allRoles } = this.state;
    return Object.keys(allRoles)
      .map((key) => {
        return {
          ...allRoles[key],
          id: key,
        };
      })
      .filter((role) => role.allowScopes.includes(scope))
      .map((role) => {
        return {
          value: role.id,
          key: role.id,
          text: role.name,
        };
      });
  }

  render() {
    const { error, loading, scopedOrganizationIds, showAddOrganizationModal } =
      this.state;
    const { enableOrganizationScopes } = this.props;
    if (loading) return <Loader />;
    if (error) return <ErrorMessage error={error} />;
    return (
      <>
        <Form.Dropdown
          name="globalRoles"
          label={
            <label>
              Global Roles
              <Popup
                content="Global scoped roles give a user permissions across all organizations."
                on="click"
                trigger={
                  <Icon
                    style={{
                      marginLeft: '5px',
                      cursor: 'pointer',
                      color: '#cccccc',
                    }}
                    name="question-circle"
                  />
                }
              />
            </label>
          }
          fluid
          selection
          multiple
          value={this.getGlobalValues()}
          options={this.getOptionsForScope('global')}
          onChange={(e, { value }) => this.setGlobalValues(value)}
        />
        {scopedOrganizationIds.map((organizationId) => {
          const name = `organization-${organizationId}`;
          return (
            <FetchObject
              key={name}
              id={organizationId}
              endpoint="organizations">
              {(organization) => {
                return (
                  <Form.Dropdown
                    name={name}
                    label={
                      <>
                        {organization.name} Organization Roles
                        <Popup
                          content="Organization scoped roles give a user permissions for a single organization (overrides locations)."
                          on="click"
                          trigger={
                            <Icon
                              style={{
                                marginLeft: '5px',
                                cursor: 'pointer',
                                color: '#cccccc',
                              }}
                              name="help circle"
                            />
                          }
                        />
                      </>
                    }
                    fluid
                    selection
                    multiple
                    value={this.getScopedValues('organization', organizationId)}
                    options={this.getOptionsForScope('organization')}
                    onChange={(e, { value }) =>
                      this.setScopedValues(
                        'organization',
                        organizationId,
                        value
                      )
                    }
                  />
                );
              }}
            </FetchObject>
          );
        })}
        <Modal
          open={showAddOrganizationModal}
          onClose={() => this.setState({ showAddOrganizationModal: false })}
          content={
            <Modal.Content>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  this.addOrganizationScope();
                  this.setState({ showAddOrganizationModal: false });
                }}>
                <Form.Field>
                  <label>Select Organization</label>
                  <SearchDropdown
                    onChange={(e, { value }) => {
                      this.setState({ currentOrganization: value });
                    }}
                    fluid
                    onDataNeeded={this.fetchOrganizations}
                    search={false}
                    value={this.state.currentOrganization}
                  />
                </Form.Field>
                <Button
                  primary
                  submit
                  content="Add"
                  onClick={(e) => {
                    e.preventDefault();
                    this.addOrganizationScope();
                    this.setState({ showAddOrganizationModal: false });
                  }}
                />
              </Form>
            </Modal.Content>
          }
          size="tiny"
          on="click"
        />
        {enableOrganizationScopes && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              this.setState({ showAddOrganizationModal: true });
            }}
            basic
            icon="plus"
            content="Add Organization Scope"
            size="tiny"
          />
        )}
      </>
    );
  }
}
