export const EMAIL_REG = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export function isValidEmail(email = '') {
  return EMAIL_REG.test(email);
}
