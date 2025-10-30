import { useSession } from 'stores/session';

import ChipsField from './Chips';

export default function RolesField(props) {
  const { scope, scopeRef, value: roles } = props;

  const { meta } = useSession();

  function getValues() {
    return roles.map((r) => {
      return r.role;
    });
  }

  function onChange(name, values) {
    const roles = values.map((value) => {
      return {
        scope,
        scopeRef,
        role: value,
      };
    });
    props.onChange(name, roles);
  }

  const options = Object.entries(meta.roles).map(([key, value]) => {
    return {
      label: value.name,
      value: key,
    };
  });

  return (
    <ChipsField
      {...props}
      value={getValues()}
      options={options}
      onChange={onChange}
    />
  );
}
