const mongoose = require('mongoose');
const { kebabCase } = require('lodash');
const { csvExport } = require('./csv');
const { dedent: d } = require('./string');
const { createAdmin } = require('./testing');
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
  describe('basic', () => {
    it('should export a simple object', async () => {
      const csv = await run([user], {
        fields: ['firstName', 'lastName'],
      });
      expect(csv).toBe(d`
      First Name,Last Name
      John,Doe
    `);
    });

    it('should export nested objects', async () => {
      const csv = await run([{ user }], {
        fields: ['user.firstName', 'user.lastName'],
      });
      expect(csv).toBe(d`
      User First Name,User Last Name
      John,Doe
    `);
    });

    it('should export multiple nested', async () => {
      const csv = await run([{ user }, { user }, { user }], {
        fields: ['user.firstName', 'user.lastName'],
      });
      expect(csv).toBe(d`
      User First Name,User Last Name
      John,Doe
      John,Doe
      John,Doe
    `);
    });

    it('should include specific fields', async () => {
      const csv = await run([complex], {
        fields: ['status', 'user.firstName', 'address.city'],
      });
      expect(csv).toBe(d`
      Status,User First Name,Address City
      active,John,Baltimore
    `);
    });

    it('should export object as JSON', async () => {
      const csv = await run([complex], {
        fields: ['user'],
      });
      expect(csv).toBe(d`
      User
      "{""firstName"":""John"",""lastName"":""Doe""}"
    `);
    });

    it('should follow include order', async () => {
      const csv = await run([complex], {
        fields: ['address.city', 'status', 'user.firstName'],
      });
      expect(csv).toBe(d`
      Address City,Status,User First Name
      Baltimore,active,John
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
        fields: ['name', 'projectId'],
      });
      expect(csv).toBe(d`
      Name,Project Id
      Frank,${projectId}
    `);
    });

    it('should provide default fields for an item', async () => {
      const csv = await run([complex]);
      expect(csv).toBe(d`
      User First Name,User Last Name,Status,Address City,Address State
      John,Doe,active,Baltimore,MD
    `);
    });

    it('should provide default fields for arrays', async () => {
      const obj = {
        firstName: 'John',
        lastName: 'Doe',
        profiles: [
          {
            address: {
              city: 'Baltimore',
              state: 'MD',
            },
          },
          {
            address: {
              city: 'Denver',
              state: 'CO',
            },
          },
        ],
      };

      const csv = await run([obj]);
      expect(csv).toBe(d`
      First Name,Last Name,Profiles 0 Address City,Profiles 0 Address State,Profiles 1 Address City,Profiles 1 Address State
      John,Doe,Baltimore,MD,Denver,CO
    `);
    });

    it('should not fail when no data provided', async () => {
      const csv = await run([]);
      expect(csv).toBe('');
    });
  });

  describe('documents', () => {
    describe('basic', () => {
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

      it('should export an array of documents', async () => {
        const shop = await Shop.create({
          name: 'Demo',
          profits: 1000,
        });

        const csv = await run([shop], {
          fields: ['name', 'profits'],
        });
        expect(csv).toBe(d`
      Name,Profits
      Demo,"1,000"
    `);
      });

      it('should provide default fields for a document', async () => {
        const shop = await Shop.create({
          name: 'Demo',
          profits: 1000,
        });

        const csv = await run([shop]);
        expect(csv).toBe(d`
      Name,Profits
      Demo,"1,000"
    `);
      });
    });

    describe('array fields', () => {
      it('should export basic string array', async () => {
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
          aliases: [
            {
              type: 'String',
            },
          ],
        });

        const user = await User.create({
          name: 'Harry',
          aliases: ['Bart', 'Kevin'],
        });

        const csv = await run([user], {
          fields: ['name', 'aliases'],
        });
        expect(csv).toBe(d`
      Name,Aliases 0,Aliases 1
      Harry,Bart,Kevin
    `);
      });

      it('should get defaults for basic string array', async () => {
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
          aliases: [
            {
              type: 'String',
            },
          ],
        });

        const user = await User.create({
          name: 'Harry',
          aliases: ['Bart', 'Kevin'],
        });

        const csv = await run([user]);
        expect(csv).toBe(d`
      Name,Aliases 0,Aliases 1
      Harry,Bart,Kevin
    `);
      });

      it('should export complex array', async () => {
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
          accounts: [
            {
              name: 'String',
            },
          ],
        });

        const user = await User.create({
          name: 'Harry',
          accounts: [
            {
              name: 'account-1',
            },
            {
              name: 'account-2',
            },
          ],
        });

        const csv = await run([user], {
          fields: ['name', 'accounts.name'],
        });
        expect(csv).toBe(d`
      Name,Accounts 0 Name,Accounts 1 Name
      Harry,account-1,account-2
    `);
      });

      it('should export deep array', async () => {
        const User = createTestModel({
          a: [
            {
              b: [
                {
                  name: 'String',
                },
              ],
            },
          ],
        });

        const user = await User.create({
          a: [
            {
              b: [
                {
                  name: 'a0b0',
                },
                {
                  name: 'a0b1',
                },
              ],
            },
            {
              b: [
                {
                  name: 'a1b0',
                },
                {
                  name: 'a1b1',
                },
              ],
            },
          ],
        });

        const csv = await run([user], {
          fields: ['a.b.name'],
        });
        expect(csv).toBe(d`
      A 0 B 0 Name,A 0 B 1 Name,A 1 B 0 Name,A 1 B 1 Name
      a0b0,a0b1,a1b0,a1b1
    `);
      });

      it('should prioritize array index order for nested fields', async () => {
        const User = createTestModel({
          profiles: [
            {
              name: 'String',
              age: 'Number',
            },
          ],
        });

        const user = await User.create({
          profiles: [
            {
              name: 'Harry',
              age: 21,
            },
            {
              name: 'Barry',
              age: 23,
            },
          ],
        });

        const csv = await run([user], {
          fields: ['profiles.name', 'profiles.age'],
        });
        expect(csv).toBe(d`
      Profiles 0 Name,Profiles 0 Age,Profiles 1 Name,Profiles 1 Age
      Harry,21,Barry,23
    `);
      });
    });

    describe('populated fields', () => {
      it('should get defaults for populated fields', async () => {
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
        });
        const Shop = createTestModel({
          revenue: 'Number',
          owner: {
            type: 'ObjectId',
            ref: User.modelName,
            required: true,
          },
        });

        const user = await User.create({
          name: 'Harry',
        });

        const shop = await Shop.create({
          revenue: 1000,
          owner: user,
        });

        const csv = await run([shop]);
        expect(csv).toBe(d`
        Revenue,Owner Name
        "1,000",Harry
    `);
      });

      it('should get defaults for array populated fields', async () => {
        const Shop = createTestModel({
          revenue: 'Number',
        });
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
          shops: [
            {
              type: 'ObjectId',
              ref: Shop.modelName,
              required: true,
            },
          ],
        });

        const shop1 = await Shop.create({
          revenue: 1000,
        });

        const shop2 = await Shop.create({
          revenue: 2000,
        });

        const user = await User.create({
          name: 'Harry',
          shops: [shop1, shop2],
        });

        const csv = await run([user]);
        expect(csv).toBe(d`
        Name,Shops 0 Revenue,Shops 1 Revenue
        Harry,"1,000","2,000"
    `);
      });

      it('should expand nested array fields', async () => {
        const Product = createTestModel({
          name: 'String',
        });
        const Shop = createTestModel({
          revenue: 'Number',
          products: [
            {
              type: 'ObjectId',
              ref: Product.modelName,
            },
          ],
        });
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
          shop: {
            type: 'ObjectId',
            ref: Shop.modelName,
            required: true,
          },
        });

        const product1 = await Product.create({
          name: 'Product 1',
        });

        const product2 = await Product.create({
          name: 'Product 2',
        });

        const shop = await Shop.create({
          revenue: 1000,
          products: [product1, product2],
        });

        const user = await User.create({
          name: 'Harry',
          shop,
        });

        const csv = await run([user], {
          fields: ['shop.revenue', 'shop.products.name'],
        });
        expect(csv).toBe(d`
        Shop Revenue,Shop Products 0 Name,Shop Products 1 Name
        "1,000",Product 1,Product 2
    `);
      });
    });

    describe('upload fields', () => {
      it('should export a link to an upload', async () => {
        const Shop = createTestModel({
          image: {
            type: 'ObjectId',
            ref: 'Upload',
          },
        });

        const image = new mongoose.Types.ObjectId();
        const shop = await Shop.create({
          image,
        });
        const csv = await run([shop], {
          fields: ['image'],
        });
        expect(csv).toBe(d`
        Image
        http://localhost:2300/1/uploads/${image}/raw
    `);
      });
    });

    describe('private fields', () => {
      const User = createTestModel({
        name: {
          type: 'String',
          required: true,
        },
        age: {
          type: 'Number',
          required: true,
          readAccess: 'admin',
        },
      });

      let user;

      beforeEach(async () => {
        user = await User.create({
          name: 'Harry',
          age: 32,
        });
      });

      it('should not export private fields', async () => {
        const csv = await run([user], {
          fields: ['name', 'age'],
        });
        expect(csv).toBe(d`
      Name,Age
      Harry,
    `);
      });

      it('should export private fields as admin', async () => {
        const admin = await createAdmin();

        const csv = await run([user], {
          authUser: admin,
          fields: ['name', 'age'],
        });

        expect(csv).toBe(d`
      Name,Age
      Harry,32
    `);
      });
    });

    describe('custom fields', () => {
      it('should be able to inject a custom field', async () => {
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
        });

        const user = await User.create({
          name: 'Harry',
        });

        const csv = await run([user], {
          fields: ['name', 'link'],
          mapFields: {
            link: (user) => {
              return `http://foo.com/${user.id}`;
            },
          },
        });
        expect(csv).toBe(d`
      Name,Link
      Harry,http://foo.com/${user.id}
    `);
      });

      it('should be able to map array fields', async () => {
        const User = createTestModel({
          names: [
            {
              type: 'String',
            },
          ],
        });

        const user = await User.create({
          names: ['Harry', 'Barry'],
        });

        const csv = await run([user], {
          fields: ['names'],
          mapFields: {
            names: (user) => {
              return user.names.join(' | ');
            },
          },
        });
        expect(csv).toBe(d`
      Names
      "Harry | Barry"
    `);
      });

      it('should not error if no field defined', async () => {
        const User = createTestModel({
          name: {
            type: 'String',
            required: true,
          },
        });

        const user = await User.create({
          name: 'Harry',
        });

        const csv = await run([user], {
          fields: ['name', 'link'],
        });
        expect(csv).toBe(d`
      Name,Link
      Harry,
    `);
      });
    });

    describe('headers', () => {
      it('should be able to disable readable headers', async () => {
        const User = createTestModel({
          name: 'String',
          fooBar: 'String',
        });

        const user = await User.create({
          name: 'Harry',
          fooBar: 'Hello',
        });

        const csv = await run([user], {
          readableHeaders: false,
        });
        expect(csv).toBe(d`
      name,fooBar
      Harry,Hello
    `);
      });

      it('should allow a custom header function', async () => {
        const User = createTestModel({
          name: 'String',
          fooBar: 'String',
        });

        const user = await User.create({
          name: 'Harry',
          fooBar: 'Hello',
        });

        const csv = await run([user], {
          getHeader: kebabCase,
        });
        expect(csv).toBe(d`
      name,foo-bar
      Harry,Hello
    `);
      });

      it('should be able to map a single header as a one-off', async () => {
        const User = createTestModel({
          name: 'String',
          dob: 'Date',
        });

        const user = await User.create({
          name: 'Harry',
          dob: new Date('1980-01-01T00:00:00.000Z'),
        });

        const csv = await run([user], {
          getHeader: (name) => {
            if (name === 'dob') {
              return 'Date of Birth';
            }
          },
        });
        expect(csv).toBe(d`
      Name,Date of Birth
      Harry,1980-01-01T00:00:00.000Z
    `);
      });
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
