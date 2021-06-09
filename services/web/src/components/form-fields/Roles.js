import React from 'react';
import { once, uniq, uniqBy } from 'lodash';
import { request } from 'utils/api';
import { Form, Dropdown, Popup, Icon, Message } from 'semantic';
import SearchDropdown from 'components/SearchDropdown';

const fetchRoles = once(async () => {
  const { data } = await request({
    method: 'GET',
    path: `/1/users/roles`,
  });
  return data;
});

export default class Roles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: 'all',
      error: null,
      roles: null,
      loading: true,
      organizations: [],
    };
  }

  componentDidMount() {
    this.fetchRoles();
  }

  fetchRoles = async () => {
    try {
      this.setState({
        loading: true,
      });
      const roles = await fetchRoles();
      const organizations = await this.fetchRequiredOrganizations();
      this.setState({
        roles,
        organizations,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  fetchOrganizations = async (keyword) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/organizations/search',
      body: {
        keyword,
      },
    });
    return data;
  };

  fetchRequiredOrganizations = async () => {
    const { value } = this.props;
    const ids = uniq(
      value
        .filter((role) => {
          return role.scope === 'organization';
        })
        .map((role) => {
          return role.scopeRef;
        })
    );
    if (ids.length) {
      const { data } = await request({
        method: 'POST',
        path: '/1/organizations/search',
        body: {
          ids,
        },
      });
      return data;
    }
    return [];
  };

  // Consolidated roles dropdown

  onChange = (evt, { value, ...rest }) => {
    if (value.includes('add')) {
      this.setState({
        input: 'search',
      });
    } else {
      const { roles } = this.state;
      value = value.map((value) => {
        const [scope, role, scopeRef] = value.split(':');
        return {
          scope,
          role,
          scopeRef,
          roleDefinition: roles[role],
        };
      });
      this.props.onChange(evt, { value, ...rest });
    }
  };

  getValues() {
    if (this.state.loading) {
      return [];
    }
    return this.props.value.map((role) => this.getRoleId(role));
  }

  getOptions() {
    return [
      ...this.getGlobalOptions(),
      ...this.getOrganizationOptions(),
      {
        text: 'Add Organization Role',
        value: 'add',
      },
    ];
  }

  getGlobalOptions() {
    const { roles } = this.state;
    return Object.entries(roles || {})
      .filter(([, role]) => {
        return role.allowScopes.includes('global');
      })
      .map(([id, role]) => {
        return {
          value: `global:${id}`,
          text: (
            <React.Fragment>
              <Icon name="globe" />
              {role.name}
            </React.Fragment>
          ),
        };
      });
  }

  getOrganizationOptions() {
    if (this.state.loading) {
      return [];
    }
    const { value } = this.props;
    const { organizations } = this.state;
    return value
      .filter((role) => {
        return role.scope === 'organization';
      })
      .map((role) => {
        const org = organizations.find((org) => {
          return org.id === role.scopeRef;
        });
        return {
          value: this.getRoleId(role),
          text: (
            <React.Fragment>
              <Icon name="building" />
              {org.name} {role.roleDefinition.name}
            </React.Fragment>
          ),
        };
      });
  }

  getRoleId(role) {
    return [role.scope, role.role, role.scopeRef]
      .filter((str) => str)
      .join(':');
  }

  // Organization search dropdown

  onSearchChange = (evt, { value: organization }) => {
    this.setState({
      input: 'roles',
      organization,
    });
  };

  // Select role dropdown

  getSelectOptions() {
    const { roles } = this.state;
    return Object.entries(roles || {})
      .filter(([, role]) => {
        return role.allowScopes.includes('organization');
      })
      .map(([id, role]) => {
        return {
          value: id,
          text: role.name,
        };
      });
  }

  onSelectChange = (evt, { value: role, ...rest }) => {
    const { roles, organization, organizations } = this.state;
    let { value } = this.props;
    value = uniqBy([
      ...value,
      {
        role,
        scope: 'organization',
        scopeRef: organization.id,
        roleDefinition: roles[role],
      },
    ], (role) => this.getRoleId(role));
    this.props.onChange(evt, { value, ...rest });
    this.setState({
      input: 'all',
      organization: null,
      organizations: uniqBy([...organizations, organization], (org) => org.id),
    });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return <Message error content={error.message} />;
    }
    return (
      <Form.Field>
        <label htmlFor="roles">
          Roles
          <Popup
            content="Roles may be global or scoped to an organization."
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
        {this.renderInput()}
      </Form.Field>
    );
  }

  renderInput() {
    const { input } = this.state;
    if (input === 'all') {
      return this.renderAll();
    } else if (input === 'search') {
      return this.renderSearch();
    } else if (input === 'roles') {
      return this.renderRoles();
    }
  }

  renderAll() {
    return (
      <Dropdown
        fluid
        multiple
        selection
        name="roles"
        value={this.getValues()}
        options={this.getOptions()}
        onChange={this.onChange}
        loading={this.state.loading}
      />
    );
  }

  renderSearch() {
    return (
      <SearchDropdown
        fluid
        placeholder="Select Organization"
        onChange={this.onSearchChange}
        onDataNeeded={this.fetchOrganizations}
      />
    );
  }

  renderRoles() {
    return (
      <Dropdown
        fluid
        selection
        placeholder="Select Role"
        options={this.getSelectOptions()}
        onChange={this.onSelectChange}
      />
    );
  }

}
