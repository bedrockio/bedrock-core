const { Category } = require('../../src/models');

const CATEGORIES = [
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
];

module.exports = async () => {
  const categories = {};
  await Promise.all(
    CATEGORIES.map(async (name) => {
      categories[name] = await Category.create({
        name,
      });
    })
  );
  return categories;
};
