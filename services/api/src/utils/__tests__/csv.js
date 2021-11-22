const mongoose = require('mongoose');
const { csvExport } = require('../csv');
const { dedent: d } = require('../string');

const user = {
  firstName: 'John',
  lastName: 'Doe',
};

const complex = {
  user,
  status: 'active',
  address: {
    city: 'Baltimore',
    state: 'MD',
  },
};

describe('csvExport', () => {
  it('should export a simple object', async () => {
    const csv = await run([user]);
    expect(csv).toBe(d`
      firstName,lastName
      John,Doe
    `);
  });

  it('should export nested objects', async () => {
    const csv = await run([{ user }]);
    expect(csv).toBe(d`
      user.firstName,user.lastName
      John,Doe
    `);
  });

  it('should export multiple nested', async () => {
    const csv = await run([{ user }, { user }, { user }]);
    expect(csv).toBe(d`
      user.firstName,user.lastName
      John,Doe
      John,Doe
      John,Doe
    `);
  });

  it('should include specific fields', async () => {
    const csv = await run([complex], {
      include: ['status', 'user.firstName,', 'address.city,'],
    });
    expect(csv).toBe(d`
      status,user.firstName,address.city
      active,John,Baltimore
    `);
  });

  it('should include specific parents', async () => {
    const csv = await run([complex], {
      include: ['status', 'user', 'address.city'],
    });
    expect(csv).toBe(d`
      status,user.firstName,user.lastName,address.city
      active,John,Doe,Baltimore
    `);
  });

  it('should follow include order', async () => {
    const csv = await run([complex], {
      include: ['address.city', 'status', 'user.firstName,'],
    });
    expect(csv).toBe(d`
      address.city,status,user.firstName
      Baltimore,active,John
    `);
  });

  it('should exclude specific fields', async () => {
    const csv = await run([complex], {
      exclude: ['user.lastName', 'address.city'],
    });
    expect(csv).toBe(d`
      user.firstName,status,address.state
      John,active,MD
    `);
  });

  it('should call toObject to prevent private field access', async () => {
    const obj = {
      user,
      toObject: () => {
        return {
          user: {
            firstName: 'Frank',
            lastName: 'Reynolds',
          },
        };
      },
    };
    const csv = await run([obj]);
    expect(csv).toBe(d`
      user.firstName,user.lastName
      Frank,Reynolds
    `);
  });

  it('should not expose ObjectId or id field unless included', async () => {
    const userId = mongoose.Types.ObjectId();
    const projectId = mongoose.Types.ObjectId();
    const obj = {
      id: 'foo',
      name: 'Frank',
      userId,
      projectId,
    };
    const csv = await run([obj], {
      include: ['name', 'projectId'],
    });
    expect(csv).toBe(d`
      name,projectId
      Frank,${projectId}
    `);
  });
});

async function run(arr, options) {
  const ctx = {
    set: () => {},
  };
  csvExport(ctx, arr, { filename: 'test.csv', ...options });
  return await streamToString(ctx.body);
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}
