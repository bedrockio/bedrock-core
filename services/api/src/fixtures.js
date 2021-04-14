const { User, Product, Shop, Upload, Category } = require('./models');
const config = require('@bedrockio/config');
const { storeUploadedFile } = require('./utils/uploads');
const { logger } = require('@bedrockio/instrumentation');

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = config.getAll();

const createAdmin = async () => {
  const [firstName, lastName] = ADMIN_NAME.split(' ');
  return await User.create({
    firstName,
    lastName,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    roles: [{ scope: 'global', role: 'superAdmin' }],
  });
};

const createUpload = async (owner, image) => {
  const path = `${__dirname}/../fixtures/images/${image}`;
  const file = { path, name: image, type: 'image/jpeg' };
  const object = await storeUploadedFile(file);
  return Upload.create({
    ...object,
    ownerId: owner._id,
  });
};

const createFixtures = async () => {
  if (await User.findOne({ email: ADMIN_EMAIL })) {
    return false;
  }

  logger.info('Creating DB fixtures');

  const categories = await Promise.all(
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
    ].map(async (name) => {
      return await Category.create({
        name,
      });
    })
  );

  const adminUser = await createAdmin();
  logger.info(`Added admin user ${adminUser.email} to database`);

  const shop = await Shop.create({
    name: 'Demo',
    images: [await createUpload(adminUser, 'Shop.jpg')],
    categories: [categories[0], categories[1], categories[2]],
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
  createFixtures,
};
