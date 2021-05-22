import React from 'react';
import { Sticky, Dropdown, Menu } from 'semantic-ui-react';
import Desktop from './Desktop';
import Mobile from './Mobile';

export default class ResponsiveMenu extends React.Component {

  render() {
    const { title, contextRef, children } = this.props;
    return (
      <React.Fragment>
        <Desktop>
          <Sticky offset={131} context={contextRef}>
            <Menu fluid pointing secondary vertical>
              {children}
            </Menu>
          </Sticky>
        </Desktop>
        <Mobile>
          <Menu style={{ marginBottom: '20px' }} fluid>
            <Dropdown text={title} className="link item" fluid>
              <Dropdown.Menu>{children}</Dropdown.Menu>
            </Dropdown>
          </Menu>
        </Mobile>
      </React.Fragment>
    );
  }
}
