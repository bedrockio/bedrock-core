import React from 'react';
import PropTypes from 'prop-types';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { Form, Label, Input, Icon } from 'semantic-ui-react';
import { formatDate } from 'utils/date';

export default class DateField extends React.Component {

  setDate(evt, date) {
    this.props.onChange(evt, {
      ...this.props,
      value: date,
    });
  }

  onDayChange = (date) => {
    this.setDate(null, date);
  }

  onHoursChange = (evt, { value }) => {
    let { value: date } = this.props;
    if (date) {
      date = new Date(date);
      date.setHours(value);
      this.setDate(evt, date);
    }
  }

  onMinutesChange = (evt, { value }) => {
    let { value: date } = this.props;
    if (date) {
      date = new Date(date);
      date.setMinutes(value);
      this.setDate(evt, date);
    }
  }

  render() {
    const { time, required, label, placeholder, clearable } = this.props;
    let { value: date } = this.props;
    if (date && typeof date === 'string') {
      date = new Date(date);
    }
    return (
      <Form.Field
        required={required}
        style={{position: 'relative'}}>
        {label && <label>{label}</label>}
        <DayPickerInput
          value={date}
          placeholder={placeholder}
          formatDate={formatDate}
          dayPickerProps={{ selectedDays: date }}
          style={{
            width: '140px',
          }}
          onDayChange={this.onDayChange}
        />
        {clearable && (
          <Icon name="x"
            color="grey"
            style={{
              position: 'absolute',
              top: '10px',
              left: '115px',
              cursor: 'pointer',
              visibility: date ? 'visible' : 'hidden'
            }}
            onClick={() => this.setDate(null)}
          />
        )}
        {time && (
          <React.Fragment>
            <Input
              type="number"
              labelPosition="right"
              style={{
                width: '5em',
                verticalAlign: 'text-top',
                margin: '0 40px 0 10px'
              }}
              value={date ? date.getHours().toString() : ''}
              onChange={this.onHoursChange}>
              <input />
              <Label>h</Label>
            </Input>
            <Input
              type="number"
              step="5"
              labelPosition="right"
              style={{
                width: '5em',
                verticalAlign: 'text-top',
              }}
              value={date ? date.getMinutes().toString().padStart(2, 0) : ''}
              onChange={this.onMinutesChange}>
              <input />
              <Label>m</Label>
            </Input>
          </React.Fragment>
        )}
      </Form.Field>
    );
  }
}

DateField.propTypes = {
  time: PropTypes.bool,
  label: PropTypes.node,
  required: PropTypes.bool,
  clearable: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
};

DateField.defaultProps = {
  time: false,
  required: false,
  clearable: false,
};
