import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

import { Form, Input, Message, Dropdown, Flag } from 'semantic';

import { COUNTRIES, getFormatLength, formatPhone } from 'utils/phone';
import { TextInput } from '@mantine/core';

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

  onChange = (evt, { value = '', ...rest }) => {
    const { country } = this.state;
    const maxLength = getFormatLength(country);

    value = value.replace(/[ ()@.+-]/g, '');
    value = value.replace(/^1(\d)/, '$1');
    value = value.replace(/[^\d-]/gi, '');
    value = value.trim();
    value = value.slice(0, maxLength);

    if (value) {
      value = `${this.getPrefix()}${value}`;
    }
    this.props.onChange(evt, {
      ...rest,
      value,
    });
  };

  render() {
    const { required, label, error } = this.props;
    return (
      <TextInput
        required={required}
        disabled={this.props.disabled}
        error={error?.hasField?.('phone')}
        label={label}
        type="tel"
        autoComplete="tel"
        value={this.renderFormattedValue()}
        onChange={this.onChange}
        ref={this.ref}
      />
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
    const { value = '' } = this.props;
    const country = COUNTRIES[this.state.country];
    return formatPhone(value, country);
  }

  renderFieldErrors() {
    const { error } = this.props;
    const details = error?.getFieldDetails?.('phone');
    if (details) {
      return (
        <React.Fragment>
          <Message size="small" error>
            <Message.Content>
              {details.map((d, i) => {
                return <div key={i}>{d.message}</div>;
              })}
            </Message.Content>
          </Message>
        </React.Fragment>
      );
    }
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
  placeholder: 'Phone Number',
};
