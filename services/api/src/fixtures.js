const { User, Role, Product, Shop, Upload, Category } = require('./models');
const config = require('@bedrockio/config');
const { storeUploadedFile } = require('./utils/uploads');
const { logger } = require('./utils/logging');
const { createMaxPermissions } = require('./utils/permissions');

const adminConfig = {
  name: config.get('ADMIN_NAME'),
  email: config.get('ADMIN_EMAIL'),
  password: config.get('ADMIN_PASSWORD'),
};

const roles = [
  {
    name: 'Super Admin',
    context: 'global',
    permissions: createMaxPermissions('global'),
  },
  {
    name: 'Organization Owner',
    context: 'organization',
    permissions: createMaxPermissions('organization'),
  },
];

const createUpload = async (owner, image) => {
  const path = `${__dirname}/../fixtures/images/${image}`;
  const file = { path, name: image, type: 'image/jpeg' };
  const object = await storeUploadedFile(file);
  return Upload.create({
    ...object,
    ownerId: owner._id,
  });
};

const createRoles = async () => {
  for (const role of roles) {
    await Role.create(role);
  }
};

const createFixtures = async () => {
  if (await User.findOne({ email: adminConfig.email })) {
    return false;
  }

  logger.info('Creating DB fixtures');
  await createRoles();

  [
    'jewelry',
    'toy',
    'florist',
    'hairdresser',
    'barber',
    'shoe',
    'clothes',
    'hardware',
    'delicatessen',
    'books',
    'pets',
    'chemist',
    'fishmonger',
    'butcher',
    'baker',
    'supermarket',
    'grocer',
    'department',
    'tea',
    'music',
    'optician',
    'travel',
    'design',
  ].forEach(async (name) => {
    await Category.create({
      name,
    });
  });

  const adminUser = await User.create({
    roles: [
      {
        context: 'global',
        role: await Role.findOne({ name: 'Super Admin' }),
      },
    ],
    ...adminConfig,
  });
  console.info(`Added admin user ${adminUser.email} to database`);

  const shop = await Shop.create({
    name: 'Demo',
    images: [await createUpload(adminUser, 'Shop.jpg')],
  });

  for (let i = 0; i < 15; i++) {
    await Product.create({
      name: `Product ${i + 1}`,
      shop,
      images: [await createUpload(adminUser, `Product ${i + 1}.jpg`)],
    });
  }
  return true;
};

module.exports = {
  createRoles,
  createFixtures,
};
