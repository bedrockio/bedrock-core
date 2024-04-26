const mongoose = require('mongoose');
const { csvExport } = require('../csv');
const { dedent: d } = require('../string');
const { createUser } = require('../testing/index');
const { createTestModel } = require('@bedrockio/model');

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
    const userId = new mongoose.Types.ObjectId();
    const projectId = new mongoose.Types.ObjectId();
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

  describe('documents', () => {
    it('should succeed given an array of documents', async () => {
      const Shop = createTestModel({
        name: {
          type: 'String',
          required: true,
        },
        profits: {
          type: 'Number',
          required: true,
        },
      });

      const shop = await Shop.create({
        name: 'Demo',
        profits: 1000,
      });

      const csv = await run([shop], {
        include: ['name', 'profits'],
      });
      expect(csv).toBe(d`
      name,profits
      Demo,"1,000"
    `);
    });

    it('should not expose restricted read access', async () => {
      const Shop = createTestModel({
        name: {
          type: 'String',
          required: true,
        },
        profits: {
          type: 'Number',
          required: true,
          readAccess: 'superAdmin',
        },
      });

      const shop = await Shop.create({
        name: 'Demo',
        profits: 1000,
      });

      const user = await createUser({
        firstName: 'Frank',
        lastName: 'Reynolds',
      });

      const csv = await run([shop], {
        authUser: user,
        include: ['name', 'profits'],
      });
      expect(csv).toBe(d`
      name
      Demo
    `);
    });

    it('should expose restricted read access when allowed', async () => {
      const Shop = createTestModel({
        name: {
          type: 'String',
          required: true,
        },
        profits: {
          type: 'Number',
          required: true,
          readAccess: 'superAdmin',
        },
      });

      const shop = await Shop.create({
        name: 'Demo',
        profits: 1000,
      });

      const admin = await createUser({
        firstName: 'Frank',
        lastName: 'Reynolds',
        roles: [
          {
            role: 'superAdmin',
            scope: 'global',
          },
        ],
      });

      const csv = await run([shop], {
        authUser: admin,
        include: ['name', 'profits'],
      });
      expect(csv).toBe(d`
      name,profits
      Demo,"1,000"
    `);
    });
  });
});

async function run(arr, options = {}) {
  const { authUser, ...rest } = options;
  const ctx = {
    set: () => {},
    state: {
      authUser,
    },
  };
  csvExport(ctx, arr, { filename: 'test.csv', ...rest });
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
