import React from 'react';
import { get, set } from 'lodash';
import { Form, Segment, Dropdown } from 'semantic';
import { loadScript } from 'utils/script';
import CountriesField from 'components/form-fields/Countries';
import UsStates from './UsStates';
import { GOOGLE_API_KEY } from 'utils/env';
import { Loader } from 'semantic-ui-react';

function extractGoogleAddressComponent(
  addressComponents,
  type,
  attribute = 'long_name'
) {
  const result = addressComponents.filter((c) => c.types.includes(type))[0];
  return result ? result[attribute] : '';
}

function composeDefaultLookupValue(address) {
  if (!address || !address.line1) return '';
  const components = [address.line1];
  if (address.city) {
    components.push(address.city);
  }
  if (address.region) {
    components.push(address.region);
  }
  if (address.countryCode) {
    components.push(address.countryCode);
  }
  return components.join(', ');
}

export default class Address extends React.Component {
  state = {
    initializing: true,
    manualEntry: false,
    error: false,
    placeOptions: [],
    lookupValue: composeDefaultLookupValue(this.props.value),
  };

  componentDidMount() {
    this.loadGoogleDependency();
  }

  async loadGoogleDependency() {
    const { disableLookup } = this.props;
    if (window.google) {
      this.initializeLookup();
      this.setState({ initializing: false });
      return;
    }
    if (disableLookup || !GOOGLE_API_KEY) {
      this.setState({ initializing: false, manualEntry: true });
      return;
    }
    await loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`
    );
    this.initializeLookup();
    this.setState({ initializing: false });
  }

  initializeLookup() {
    this.autocompleteService = new window.google.maps.places.AutocompleteService();
    this.geocoderService = new window.google.maps.Geocoder();
  }

  setField = (e, { name, value }) => {
    const currentValue = this.props.value || {};
    set(currentValue, name, value);
    this.props.onChange(e, { name: this.props.name, value: currentValue });
  };

  getAutoCompleteName(key) {
    if (this.props.autoComplete == 'off') {
      return 'off';
    }
    if (key === 'region') {
      return 'address-level1';
    }
    if (key === 'city') {
      return 'address-level2';
    }
    if (key === 'countryCode') {
      return 'address-country';
    }
    if (key === 'postalCode') {
      return 'address-postal-code';
    }
    return `address-${key}`;
  }

  onLookupSearchChange(searchQuery) {
    if (searchQuery.length) {
      this.autocompleteService.getPlacePredictions(
        { input: searchQuery },
        (placeOptions) => {
          this.setState({ placeOptions });
        }
      );
    }
  }

  onLookupResultChange(value) {
    let placeOption = this.state.placeOptions.filter(
      (o) => o.description === value
    )[0];
    const geoCodeOptions = placeOption
      ? { placeId: placeOption.place_id }
      : { address: value };
    this.geocoderService.geocode(geoCodeOptions, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        if (results[0] && results[0].geometry) {
          const { address_components } = results[0];
          const { location } = results[0].geometry;
          const geometry = {
            type: 'Point',
            coordinates: [location.lng(), location.lat()],
          };
          const address = {
            geometry,
            line1: `${extractGoogleAddressComponent(
              address_components,
              'street_number'
            )} ${extractGoogleAddressComponent(address_components, 'route')}`,
            city: extractGoogleAddressComponent(address_components, 'locality'),
            region: extractGoogleAddressComponent(
              address_components,
              'administrative_area_level_1',
              'short_name'
            ),
            countryCode: extractGoogleAddressComponent(
              address_components,
              'country',
              'short_name'
            ),
            postalCode: extractGoogleAddressComponent(
              address_components,
              'postal_code'
            ),
          };
          this.props.onChange(null, { name: this.props.name, value: address });
        }
      }
    });
  }

  renderLookupDropdown() {
    const { placeOptions, error, lookupValue } = this.state;

    const options = (placeOptions || []).map((place) => {
      return {
        value: place.description,
        text: place.description,
        key: place.description,
      };
    });

    if (!options.map((o) => o.value).includes(lookupValue)) {
      options.push({
        value: lookupValue,
        text: lookupValue,
        key: lookupValue,
      });
    }

    return (
      <Form.Field error={error.message}>
        <label>Address Lookup</label>
        <Dropdown
          fluid
          clearable
          selection
          search
          name="line1"
          defaultValue={lookupValue}
          options={options}
          onChange={(e, { value }) => this.onLookupResultChange(value)}
          onSearchChange={(e, { searchQuery }) =>
            this.onLookupSearchChange(searchQuery)
          }
        />
      </Form.Field>
    );
  }

  renderFields() {
    const { manualEntry } = this.state;
    const { value } = this.props;
    return (
      <>
        {this.autocompleteService && this.renderLookupDropdown()}
        {manualEntry ? (
          <>
            <Form.Input
              type="text"
              name="line1"
              label="Address Line 1"
              value={get(value, 'line1')}
              onChange={this.setField}
              autoComplete={this.getAutoCompleteName('line1')}
            />

            <Form.Input
              type="text"
              name="line2"
              label="Address Line 2 (Optional)"
              value={get(value, 'line2')}
              onChange={this.setField}
              autoComplete={this.getAutoCompleteName('line2')}
            />
            <Form.Input
              type="text"
              name="city"
              label="City/Town"
              value={get(value, 'city')}
              onChange={this.setField}
              autoComplete={this.getAutoCompleteName('city')}
            />
            <CountriesField
              label="Country Code"
              name="countryCode"
              value={get(value, 'countryCode')}
              onChange={this.setField}
              autoComplete={this.getAutoCompleteName('countryCode')}
            />
            {get(value, 'countryCode') === 'US' ? (
              <UsStates
                name="region"
                value={get(value, 'region')}
                onChange={this.setField}
                autoComplete={this.getAutoCompleteName('region')}
              />
            ) : (
              <Form.Input
                type="text"
                name="region"
                label="State/Province"
                value={get(value, 'region')}
                onChange={this.setField}
                autoComplete={this.getAutoCompleteName('region')}
              />
            )}
            <Form.Input
              type="text"
              name="postalCode"
              label={
                get(value, 'countryCode') === 'US' ? 'Zip Code' : 'Postal Code'
              }
              value={get(value, 'postalCode')}
              onChange={this.setField}
              autoComplete={this.getAutoCompleteName('postalCode')}
            />
          </>
        ) : (
          <a
            onClick={() => this.setState({ manualEntry: true })}
            style={{ cursor: 'pointer' }}>
            Show Full Address
          </a>
        )}
      </>
    );
  }

  render() {
    const { label = 'Address' } = this.props;
    const { initializing } = this.state;
    return (
      <>
        <h4>{label}</h4>
        <Segment>
          {initializing ? <Loader active /> : this.renderFields()}
        </Segment>
      </>
    );
  }
}
