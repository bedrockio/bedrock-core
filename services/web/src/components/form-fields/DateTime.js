import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { Form, Label, Input } from 'semantic-ui-react';
import { formatDate } from 'utils/date';

const dateToState = (date) => {
  return {
    date,
    hours: date.getHours(),
    minutes: date.getMinutes()
  };
};

const stateToDate = (state, includeTime = true) => {
  if (!includeTime) {
    return state.date;
  }
  const { date, hours, minutes } = state;
  const newDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes
  );
  return newDate;
};

export default class DateTime extends React.Component {
  constructor(props) {
    super(props);
    const date = props.value ? new Date(Date.parse(props.value)) : new Date();
    this.state = dateToState(date);
  }

  setDate(date) {
    const { hours, minutes } = this.state;
    const newState = {
      date,
      hours,
      minutes
    };
    this.setState(newState);
    const dateString = stateToDate(newState).toISOString();
    this.props.onChange(dateString);
  }

  setHours(hoursStr) {
    const { date, minutes } = this.state;
    const newState = {
      date,
      hours: parseInt(hoursStr),
      minutes
    };
    this.setState(newState);
    const dateString = stateToDate(newState).toISOString();
    this.props.onChange(dateString);
  }

  setMinutes(minutesStr) {
    const { date, hours } = this.state;
    const newState = {
      date,
      minutes: parseInt(minutesStr),
      hours
    };
    this.setState(newState);
    const dateString = stateToDate(newState).toISOString();
    this.props.onChange(dateString);
  }

  render() {
    const { required, label, includeTime = true } = this.props;
    const { date, hours, minutes } = this.state;

    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}

        <DayPickerInput
          value={date}
          formatDate={formatDate}
          dayPickerProps={{ selectedDays: date }}
          style={{
            width: '140px',
            float: 'left',
            marginRight: '10px',
            marginBottom: '10px'
          }}
          onDayChange={(date) => this.setDate(date)}
        />
        {includeTime && (
          <React.Fragment>
            <Input
              type="text"
              labelPosition="right"
              style={{ width: '60px', float: 'left', marginRight: '40px' }}
              value={hours}
              onChange={(e, props) => this.setHours(props.value)}
            >
              <input />
              <Label>h</Label>
            </Input>
            <Input
              type="text"
              labelPosition="right"
              style={{ width: '60px', float: 'left' }}
              value={minutes}
              onChange={(e, props) => this.setMinutes(props.value)}
            >
              <input />
              <Label>m</Label>
            </Input>
          </React.Fragment>
        )}
      </Form.Field>
    );
  }
}
