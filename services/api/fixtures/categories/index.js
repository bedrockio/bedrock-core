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

const fixtures = {};
for (let name of CATEGORIES) {
  fixtures[name] = { name };
}
module.exports = fixtures;
