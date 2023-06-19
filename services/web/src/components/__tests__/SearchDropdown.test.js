import { render, waitFor } from '@testing-library/react';

import SearchDropdown from '../SearchDropdown';

function fetchCategories() {
  return [
    { id: 'red', name: 'Red' },
    { id: 'blue', name: 'Blue' },
  ];
}

function fetchUsers(query) {
  const users = [
    { id: '1', firstName: 'Larry', lastName: 'David' },
    { id: '2', firstName: 'Barry', lastName: 'White' },
  ];
  if (query?.keyword === 'Larry') {
    // Simulates API finding new data.
    users.push({ id: '3', firstName: 'Larry', lastName: 'Bird' });
  }
  return users;
}

describe('SearchDropdown', () => {
  describe('options', () => {
    it('should render empty dropdown', async () => {
      await waitFor(() => {
        const el = render(<SearchDropdown value="red" />);
        expect(el.getByRole('listbox').textContent).toBe('No results found.');
      });
    });

    it('should default to using name field as label', async () => {
      await waitFor(async () => {
        const el = render(
          <SearchDropdown
            value="red"
            onDataNeeded={fetchCategories}
            onChange={() => {}}
          />
        );
        const options = await el.findAllByRole('option');
        expect(options.length).toBe(2);
        expect(options[0].textContent).toBe('Red');
        expect(options[1].textContent).toBe('Blue');
      });
    });

    it('should allow a custom composite label', async () => {
      await waitFor(async () => {
        const el = render(
          <SearchDropdown
            value="red"
            onDataNeeded={fetchUsers}
            onChange={() => {}}
            getOptionLabel={(item) => {
              return [item.firstName, item.lastName].join(' ');
            }}
          />
        );
        const options = await el.findAllByRole('option');
        expect(options.length).toBe(2);
        expect(options[0].textContent).toBe('Larry David');
        expect(options[1].textContent).toBe('Barry White');
      });
    });
  });
});
