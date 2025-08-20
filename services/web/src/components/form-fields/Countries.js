import { Select } from '@mantine/core';

import allCountries from 'utils/countries';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

export default function Countries(props) {
  return <Select data={countries} {...props} />;
}
