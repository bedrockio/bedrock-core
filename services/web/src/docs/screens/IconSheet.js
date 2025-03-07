import { useState } from 'react';
import { Container } from 'semantic';

import { useClass } from 'helpers/bem';
import Meta from 'components/Meta';

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

export default function IconSheet() {
  const { className, getElementClass } = useClass('icon-sheet');

  const [current, setCurrent] = useState('Solid');

  function render() {
    return (
      <div className={className}>
        <Meta title="Icons" />
        {renderSidebar()}
        <main className={getElementClass('page')}>
          <Container>{renderCurrentSet()}</Container>
        </main>
      </div>
    );
  }

  function renderSidebar() {
    return (
      <aside className={getElementClass('sidebar')}>
        <h2>Icons</h2>
        <ul className={getElementClass('sidebar-scroll')}>
          {SETS.map((set) => {
            const isActive = set.name === current;
            return (
              <li key={set.name}>
                <div
                  className={getElementClass(
                    'sidebar-link',
                    isActive ? 'active' : null,
                  )}
                  onClick={() => {
                    setCurrent(set.name);
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

  function renderCurrentSet() {
    const set = SETS.find((set) => {
      return set.name === current;
    });
    if (!set) {
      return null;
    }
    return <IconSet {...set} />;
  }

  return render();
}
