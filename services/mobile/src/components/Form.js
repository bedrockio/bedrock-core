import React from 'react';

import { Native, Components, helpers, constants } from 'app';

export default class Form extends React.Component {
  state = {
    isSubmitted: false,
    values: {},
    invalidFields: []
  };

  render = () => {
    this.textInputs = {};

    return (
      <Native.View>
        {this.renderChildrenWithNewProps(this.props.children)}
      </Native.View>
    );
  };

  renderChildrenWithNewProps = (children) =>
    React.Children.map(children, (child) => {
      if (React.isValidElement(child))
        return React.cloneElement(child, this.newPropsForChild(child));
      else return child;
    });

  newPropsForChild = (child) => {
    const name = child.props.name;
    const value = this.state.values[name];
    const disabled = this.state.isSubmitted;
    const invalid = this.isFieldInvalid(name);
    const onValueChange = this.save(name);
    const invalidColor = invalid ? constants.colors.green : null;

    switch (child.type) {
      case Components.TextInput:
      case Components.EmailInput:
      case Components.PasswordInput:
        return {
          ref: (e) => (this.textInputs[name] = e),
          value,
          invalid,
          editable: !disabled,
          onChangeText: onValueChange,
          onSubmitEditing: this.onSubmitEditing(name)
        };
      case Components.Checkbox:
        return {
          value,
          disabled,
          invalid,
          onValueChange
        };
      case Components.RadioInput:
        return {
          value,
          disabled,
          invalid,
          onValueChange
        };
      case Native.Slider:
        return {
          disabled,
          onSlidingComplete: onValueChange,
          minimumTrackTintColor: invalidColor,
          maximumTrackTintColor: invalidColor
        };
      case Components.SubmitButton:
        return {
          disabled,
          onPress: this.submit,
          inProgress: this.state.isSubmitted
        };
      default:
        return {
          children: this.renderChildrenWithNewProps(child.props.children)
        };
    }
  };

  isFieldInvalid = (name) => this.state.invalidFields.includes(name);

  save = (name) => (value) =>
    this.setState({
      values: {
        ...this.state.values,
        [name]: value
      }
    });

  onSubmitEditing = (name) => () => {
    const names = Object.keys(this.textInputs);

    if (name === helpers.last(names)) this.submit();
    else {
      const currentFieldIndex = names.indexOf(name);
      const nextFieldIndex = currentFieldIndex + 1;
      const nextFieldName = names[nextFieldIndex];
      const nextField = this.textInputs[nextFieldName];

      nextField.focus();
    }
  };

  submit = () => this.setIsSubmitted(true);

  // Form submission is handled in componentDidUpdate in order to ensure that the form can't be double-submitted if it doesn't re-render to disable the submit button before the button is tapped again -- the form can only ever be submitted once, upon transition of the state from not submitted to submitted.
  componentDidUpdate = async (prevProps, prevState) => {
    // Only execute if the form was not previously, but is now, submitted.
    if (prevState.isSubmitted || !this.state.isSubmitted) return;

    const validations = helpers.validations.object(this.props.validations);
    let values;

    try {
      values = await validations.validate(this.state.values, {
        abortEarly: false
      });
    } catch (error) {
      this.setNotSubmitted();

      if (error instanceof helpers.validations.ValidationError)
        this.setInvalidFields(error.inner.map((error) => error.path));
      else throw error;

      return;
    }

    this.setInvalidFields([]);

    if (this.props.onSubmit) {
      try {
        await this.props.onSubmit(values);
      } catch (error) {
        this.setNotSubmitted();

        let message = error;

        if (error instanceof Error) {
          message = error.message;
          helpers.log(`${message}\n\n${error.stack}`);
        }

        Native.Alert.alert(
          helpers.sentenceCase(message),
          'Please correct the problem and try again.'
        );

        return;
      }
    }

    if (this.props.resetAfterSubmit) this.setNotSubmitted();

    if (this.props.destination) helpers.goToScreen(this.props.destination);
  };

  setInvalidFields = (invalidFields) => this.setState({ invalidFields });

  setIsSubmitted = (isSubmitted) => this.setState({ isSubmitted });

  setNotSubmitted = () => this.setIsSubmitted(false);
}
