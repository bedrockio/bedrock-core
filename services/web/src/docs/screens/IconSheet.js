import React from 'react';
import { Container } from 'semantic';

import bem from 'helpers/bem';
import screen from 'helpers/screen';

import brandIcons from 'semantic/assets/icons/brands.svg';
import regularIcons from 'semantic/assets/icons/regular.svg';
import solidIcons from 'semantic/assets/icons/solid.svg';

import IconSet from './IconSet';

const SETS = [
  {
    name: 'Solid',
    url: solidIcons,
    type: 'default',
  },
  {
    name: 'Regular',
    type: 'regular',
    url: regularIcons,
  },
  {
    name: 'Brand',
    type: 'brands',
    url: brandIcons,
  },
];

@bem
@screen
export default class IconSheet extends React.Component {
  static layout = 'portal';

  contextRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      current: 'Solid',
    };
  }

  render() {
    return (
      <div className={this.getBlockClass()}>
        {this.renderSidebar()}
        <main className={this.getElementClass('page')}>
          <Container>{this.renderCurrentSet()}</Container>
        </main>
      </div>
    );
  }

  renderSidebar() {
    const { current } = this.state;
    return (
      <aside className={this.getElementClass('sidebar')}>
        <h2>Icons</h2>
        <ul className={this.getElementClass('sidebar-scroll')}>
          {SETS.map((set) => {
            const isActive = set.name === current;
            return (
              <li key={set.name}>
                <div
                  className={this.getElementClass(
                    'sidebar-link',
                    isActive ? 'active' : null
                  )}
                  onClick={() => {
                    this.setState({
                      current: set.name,
                    });
                  }}>
                  {set.name}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  renderCurrentSet() {
    const { current } = this.state;
    const set = SETS.find((set) => {
      return set.name === current;
    });
    if (!set) {
      return null;
    }
    return <IconSet {...set} />;
  }
}
