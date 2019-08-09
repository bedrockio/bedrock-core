const User = require('../src/models/user');
const Product = require('../src/models/product');
const Shop = require('../src/models/shop');
const Category = require('../src/models/category');
const config = require('@kaareal/config');

const adminConfig = {
  name: config.get('ADMIN_NAME'),
  email: config.get('ADMIN_EMAIL'),
  password: config.get('ADMIN_PASSWORD'),
  roles: ['admin']
};

const createUsers = async () => {
  if (await User.findOne({ email: adminConfig.email })) {
    return false;
  }

  [
    'jewellery',
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
    'design'
  ].forEach(async (name) => {
    await Category.create({
      name
    });
  });

  const adminUser = await User.create(adminConfig);
  console.info(`Added admin user ${adminUser.email}  to database`);

  const shop = await Shop.create({
    name: 'Demo'
  });

  for (let i = 0; i < 15; i++) {
    await Product.create({ name: `Product ${i + 1}`, shopId: shop.id });
  }
  return true;
};

module.exports = createUsers;
