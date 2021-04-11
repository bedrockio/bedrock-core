// Maps value t from scale aMin -> aMax to bMin -> bMax
// on an exponential scale. Using quartic exponent as the default.
function mapExponential(val, aMin, aMax, bMin, bMax, pow = 4) {
  if (isNaN(val)) {
    throw new Error('Input value is not valid');
  } else if (val <= aMin) {
    return bMin;
  } else if (val >= aMax) {
    return bMax;
  }

  let t = (val - aMin) / (aMax - aMin);

  t = t ** pow;

  return Math.round(bMin + t * (bMax - bMin));
}

module.exports = {
  mapExponential,
};
