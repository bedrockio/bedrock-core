import React from 'react';
import { Form, Message, List, Icon, Input, Segment } from 'semantic-ui-react';

export default class ListField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      inputValue: '',
      items: props.value ? props.value.slice() : []
    };
  }

  delete(index) {
    const { items } = this.state;
    const newItems = [];
    for (let i = 0; items.length > i; i++) {
      if (i !== index) {
        newItems.push(items[i]);
      }
    }
    this.setState({ items: newItems });
    this.props.onChange(newItems);
  }

  add(text) {
    const { items } = this.state;
    items.push(text);
    this.setState({ items });
    this.props.onChange(items);
  }

  render() {
    const {
      required,
      placeholder = 'Add Item',
      label,
      type = 'text'
    } = this.props;
    const { error, items } = this.state;

    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        {error && <Message error content={error.message} />}
        <Segment>
          {items.length > 0 && (
            <List divided relaxed verticalAlign="middle" size="large">
              {items.map((text, i) => (
                <List.Item key={i} style={{ position: 'relative' }}>
                  <List.Content floated="right">
                    <Icon
                      name="delete"
                      color="blue"
                      style={{
                        float: 'right',
                        cursor: 'pointer'
                      }}
                      onClick={() => this.delete(i)}
                    />
                  </List.Content>
                  <List.Content>{text}</List.Content>
                </List.Item>
              ))}
            </List>
          )}
          <Input
            type={type}
            action={{
              icon: 'plus',
              primary: true,
              onClick: (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.add(this.state.inputValue);
                this.setState({ inputValue: '' });
              }
            }}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                e.preventDefault();
                this.add(this.state.inputValue);
                this.setState({ inputValue: '' });
              }
            }}
            placeholder={placeholder}
            value={this.state.inputValue}
            onChange={(e, props) => this.setState({ inputValue: props.value })}
          />
        </Segment>
      </Form.Field>
    );
  }
}
