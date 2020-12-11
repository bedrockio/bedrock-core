import React from 'react';
import PropTypes from 'prop-types';
import { Form, Label} from 'semantic-ui-react';
import { getCurrencySymbol } from 'utils/currency';

export default class CurrencyField extends React.Component {

  onChange = (evt, { name, value }) => {
    value = parseInt(value);
    this.props.onChange(evt, { name, value });
  }

  render() {
    let { value, cents, currency, onChange, ...rest } = this.props;
    if (cents) {
      value /= 100;
    }
    return (
      <Form.Input
        type="number"
        value={value}
        labelPosition="right"
        onChange={this.onChange}
        {...rest}>
        <Label basic>{getCurrencySymbol(currency)}</Label>
        <input />
        {currency === 'USD' && (
          <Label>.00</Label>
        )}
      </Form.Input>
    );
  }

}

CurrencyField.propTypes = {
  cents: PropTypes.bool,
  currency: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

CurrencyField.defaultProps = {
  currency: 'USD',
  cents: false,
};
