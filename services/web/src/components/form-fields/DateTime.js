import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { Form, Label, Input, Icon } from 'semantic-ui-react';
import { formatDate } from 'utils/date';

export default class DateTime extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      date: props.value ? new Date(props.value) : null,
    };
  }

  setDate(date) {
    this.setState({
      date
    });
    this.props.onChange(date);
  }

  setHours(hours) {
    const date = new Date(this.state.date);
    date.setHours(hours);
    this.setDate(date);
  }

  setMinutes(minutes) {
    const date = new Date(this.state.date);
    date.setMinutes(minutes);
    this.setDate(date);
  }

  render() {
    const { required, label, placeholder, clearable, includeTime = true } = this.props;
    const { date } = this.state;
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
          onDayChange={(date) => this.setDate(date)}
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
        {includeTime && (
          <React.Fragment>
            <Input
              type="text"
              labelPosition="right"
              style={{
                width: '60px',
                verticalAlign: 'text-top',
                margin: '0 40px 0 10px'
              }}
              value={date.getHours()}
              onChange={(e, props) => this.setHours(props.value)}>
              <input />
              <Label>h</Label>
            </Input>
            <Input
              type="text"
              labelPosition="right"
              style={{
                width: '60px',
                verticalAlign: 'text-top',
              }}
              value={date.getMinutes()}
              onChange={(e, props) => this.setMinutes(props.value)}>
              <input />
              <Label>m</Label>
            </Input>
          </React.Fragment>
        )}
      </Form.Field>
    );
  }
}
