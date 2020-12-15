const { validatePermissions } = require('../permissions');

describe('permissions', () => {
  it('should determine validatePermissions', () => {
    const validation1 = () => {
      return validatePermissions('global', { users: 'read-write' });
    };
    expect(validation1()).toBe(true);
    const validation2 = () => {
      return validatePermissions('global', { users: 'none' });
    };
    expect(validation2()).toBe(true);
    const validation3 = () => {
      return validatePermissions('global', { invoices: 'read-write' });
    };
    expect(validation3).toThrow(Error);
  });
});
