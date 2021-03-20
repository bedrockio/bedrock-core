import React from 'react';
import SearchDropdown from '../SearchDropdown';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
  if (query === 'Larry') {
    // Simulates API finding new data.
    users.push({ id: '3', firstName: 'Larry', lastName: 'Bird' });
  }
  return users;
}

describe('SearchDropdown', () => {
  describe('options', () => {
    it('should render empty dropdown', () => {
      const el = render(<SearchDropdown fetchData={() => []} />);
      expect(el.getByRole('listbox').textContent).toBe('No results found.');
    });

    it('should default to using name field as label', async () => {
      const el = render(<SearchDropdown fetchData={fetchCategories} />);
      const options = await el.findAllByRole('option');
      expect(options.length).toBe(2);
      expect(options[0].textContent).toBe('Red');
      expect(options[1].textContent).toBe('Blue');
    });

    it('should allow a custom composite label', async () => {
      const el = render(
        <SearchDropdown
          fetchData={fetchUsers}
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

  describe('fetching', () => {
    it('should fetch data by query', async () => {
      let options;
      const el = render(
        <SearchDropdown
          fetchData={fetchUsers}
          getOptionLabel={(item) => {
            return [item.firstName, item.lastName].join(' ');
          }}
        />
      );
      const input = await el.findByRole('textbox');
      userEvent.type(input, 'Larry');

      // semantic filters options internally by text field
      // so they will appear filtered before query is actually dispatched
      options = await el.findAllByRole('option');
      expect(options.length).toBe(1);
      expect(options[0].textContent).toBe('Larry David');

      // wait for debounce
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      options = await el.findAllByRole('option');
      expect(options.length).toBe(2);
      expect(options[0].textContent).toBe('Larry David');
      expect(options[1].textContent).toBe('Larry Bird');
    });
  });
});
