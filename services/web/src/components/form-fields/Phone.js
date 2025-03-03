import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

import { Input, Dropdown, Flag } from 'semantic';

import { COUNTRIES, formatPhone } from 'utils/phone';

import Field from './Field';

export default class PhoneField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      country: props.country,
    };
    this.ref = React.createRef();
  }

  componentDidUpdate(lastProps, lastState) {
    if (lastState.country !== this.state.country) {
      this.ref.current.focus();
    }
  }

  getPrefix() {
    const { country } = this.state;
    return COUNTRIES[country].prefix;
  }

  onChange = (evt, { value, ...rest }) => {
    value = value.replace(/[ ()@.+-]/g, '');
    value = value.replace(/^[01](\d)/, '$1');
    value = value.replace(/[a-z]/gi, '');
    value = value.trim();
    if (value) {
      value = `${this.getPrefix()}${value}`;
    } else {
      value = undefined;
    }
    this.props.onChange(evt, {
      ...rest,
      value,
    });
  };

  render() {
    const { label } = this.props;
    const props = omit(this.props, Object.keys(PhoneField.propTypes));
    return (
      <Field {...props}>
        {label && <label>{label}</label>}
        <Input
          {...Field.getInnerProps(props)}
          {...this.renderLabelProps()}
          type="tel"
          autoComplete="tel"
          value={this.renderFormattedValue()}
          onChange={this.onChange}
          ref={this.ref}
        />
      </Field>
    );
  }

  renderLabelProps() {
    const { intl, icon } = this.props;
    const { country } = this.state;
    if (intl) {
      return {
        icon: null,
        iconPosition: null,
        label: (
          <Dropdown
            scrolling
            trigger={<Flag name={country} />}
            options={Object.entries(COUNTRIES).map(([code, country]) => {
              return {
                text: (
                  <React.Fragment>
                    <Flag name={code} />
                    {country.name}{' '}
                    <span style={{ opacity: '0.5' }}>{country.prefix}</span>
                  </React.Fragment>
                ),
                value: code,
              };
            })}
            onChange={(evt, { value, ...rest }) => {
              this.setState({
                country: value,
              });
              this.props.onChange(evt, {
                ...rest,
                value: '',
              });
            }}
          />
        ),
      };
    } else if (icon) {
      return {
        icon,
        iconPosition: 'left',
      };
    }
  }

  renderFormattedValue() {
    const { value } = this.props;
    const country = COUNTRIES[this.state.country];
    return formatPhone(value, country);
  }
}

PhoneField.propTypes = {
  intl: PropTypes.bool,
  icon: PropTypes.node,
  country: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.instanceOf(Error),
};

PhoneField.defaultProps = {
  intl: false,
  icon: 'phone',
  country: 'us',
};
