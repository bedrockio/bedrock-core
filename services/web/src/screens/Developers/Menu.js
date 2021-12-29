import React from 'react';
import { Menu } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';

export default () => {
  return (
    <React.Fragment>
      <Breadcrumbs active="Developer" />
    </React.Fragment>
  );
};
