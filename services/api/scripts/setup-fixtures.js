const User = require('../src/models/user');
const Product = require('../src/models/product');
const Shop = require('../src/models/shop');
const Upload = require('../src/models/upload');
const Category = require('../src/models/category');
const config = require('@bedrockio/config');
const { storeUploadedFile } = require('../src/lib/uploads');

const adminConfig = {
  name: config.get('ADMIN_NAME'),
  email: config.get('ADMIN_EMAIL'),
  password: config.get('ADMIN_PASSWORD'),
  roles: ['admin'],
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

const createUsers = async () => {
  if (await User.findOne({ email: adminConfig.email })) {
    return false;
  }

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

  const adminUser = await User.create(adminConfig);
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
      createdAt: new Date(Date.now() - 15 * Math.random() * 24 * 3600 * 1000),
    });
  }
  return true;
};

module.exports = createUsers;
