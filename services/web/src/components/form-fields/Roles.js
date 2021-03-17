import React from 'react';
import { request } from 'utils/api';
import { Form, Loader, Message } from 'semantic-ui-react';

export default class Roles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: null,
      error: null,
      loading: true,
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
        this.setState({ roles: data, loading: false });
      })
      .catch((error) => {
        this.setState({ error, loading: false });
      });
  }

  render() {
    const { required = true, label = 'Roles', value, onChange } = this.props;
    const { error, loading, roles } = this.state;
    if (loading) return <Loader />;
    if (error) return <Message error content={error.message} />;
    return (
      <Form.Dropdown
        name="roles"
        label={label}
        required={required}
        fluid
        selection
        multiple
        value={value.map((role) => role.role) || []}
        options={Object.keys(roles).map((role) => {
          return {
            value: role,
            key: role,
            text: roles[role].name,
          };
        })}
        onChange={(e, { value }) =>
          onChange(
            value.map((role) => {
              return {
                scope: 'global',
                role,
              };
            })
          )
        }
      />
    );
  }
}
