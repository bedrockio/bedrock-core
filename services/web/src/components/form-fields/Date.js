import React from 'react';
import PropTypes from 'prop-types';
import { Form, Label, Input, Icon } from 'semantic';

import DateInput from '../DateInput';
import Layout from '../Layout';

export default class DateField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dayError: null,
    };
  }

  setDate(evt, date) {
    this.props.onChange(evt, {
      ...this.props,
      value: date,
    });
  }

  onDayChange = (date) => {
    if (!this.props.time) {
      if (this.props.end) {
        date.setUTCHours(23);
        date.setUTCMinutes(59, 59, 999);
      } else if (this.props.start) {
        date.setUTCHours(0);
        date.setUTCMinutes(0, 0, 0);
      }
    }
    this.setDate(null, date);
  };

  onDayCommit = (valid) => {
    this.setState({
      dayError: !valid,
    });
  };

  onHoursChange = (evt, { value }) => {
    let { value: date } = this.props;
    if (date) {
      date = new Date(date);
      date.setUTCHours(value);
      this.setDate(evt, date);
    }
  };

  onMinutesChange = (evt, { value }) => {
    let { value: date } = this.props;
    if (date) {
      date = new Date(date);
      date.setUTCMinutes(value);
      this.setDate(evt, date);
    }
  };

  render() {
    const { time, required, label, placeholder, error, clearable, id } =
      this.props;
    let { value: date } = this.props;

    const { dayError } = this.state;
    if (date && typeof date === 'string') {
      date = new Date(date);
    }
    return (
      <Form.Field required={required} error={dayError || error}>
        {label && <label htmlFor={id}>{label}</label>}
        <Layout horizontal center>
          <Layout.Group style={{ position: 'relative' }}>
            <DateInput
              id={id}
              value={date}
              placeholder={placeholder}
              onChange={this.onDayChange}
              onCommit={this.onDayCommit}
            />
            {clearable && (
              <Icon
                name="xmark"
                color="grey"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '5px',
                  cursor: 'pointer',
                  visibility: date ? 'visible' : 'hidden',
                }}
                onClick={() => this.setDate(null)}
              />
            )}
          </Layout.Group>
          {time && (
            <React.Fragment>
              <Input
                type="number"
                labelPosition="right"
                style={{
                  width: '5em',
                  margin: '0 40px 0 10px',
                }}
                value={date ? date.getUTCHours().toString() : ''}
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
                }}
                value={
                  date ? date.getUTCMinutes().toString().padStart(2, 0) : ''
                }
                onChange={this.onMinutesChange}>
                <input />
                <Label>m</Label>
              </Input>
            </React.Fragment>
          )}
        </Layout>
      </Form.Field>
    );
  }
}

DateField.propTypes = {
  start: PropTypes.bool,
  end: PropTypes.bool,
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
