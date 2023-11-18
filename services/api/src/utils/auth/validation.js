const yd = require('@bedrockio/yada');
const { User } = require('../../models');

const signupValidation = yd.object({
  email: yd
    .string()
    .email()
    .required()
    .custom(async (val) => {
      if (await User.exists({ email: val })) {
        throw new ProtectedError('A user with that email already exists.');
      }
    }),
  phone: yd
    .string()
    .phone()
    .custom(async (val) => {
      if (await User.exists({ phone: val })) {
        throw new ProtectedError('A user with that phone number already exists.');
      }
    }),
  firstName: yd.string().required(),
  lastName: yd.string().required(),
});

class ProtectedError extends Error {
  constructor(msg) {
    super(process.env.ENV_NAME === 'production' ? 'An error occurred.' : msg);
  }
}

module.exports = {
  signupValidation,
};
