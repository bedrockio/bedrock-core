import * as validations from 'yup';

export const validatesRequiredString = validations.string().required();

export const validatesEmail = validatesRequiredString.email();

export const validatesRequiredNumber = validations.number().required();

export const validatesConfirmation = validations
  .boolean()
  .required()
  .oneOf([true]);
