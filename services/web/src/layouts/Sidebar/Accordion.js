import React, { useState } from 'react';

import { useClass } from 'helpers/bem';

export default function SidebarLayoutAccordion(props) {
  const [active, setActive] = useState(false);

  const { className, getElementClass } = useClass(
    'sidebar-layout-accordion',
    isActive() ? 'active' : null,
  );

  function onTriggerClick() {
    setActive(!active);
  }

  function isRouteBased() {
    return !!props.active;
  }

  function getActiveRoutes() {
    const { active } = props;
    return Array.isArray(active) ? active : [active];
  }

  function isActive() {
    if (isRouteBased()) {
      const activeRoutes = getActiveRoutes();
      return activeRoutes.some((route) => {
        return location.pathname.startsWith(route);
      });
    } else {
      return active;
    }
  }

  function render() {
    return (
      <React.Fragment>
        {renderTrigger()}
        <div className={className}>{props.children}</div>
      </React.Fragment>
    );
  }

  function renderTrigger() {
    const { trigger } = props;
    if (trigger) {
      return (
        <div className={getElementClass('trigger')} onClick={onTriggerClick}>
          {trigger}
        </div>
      );
    }
  }

  return render();
}
