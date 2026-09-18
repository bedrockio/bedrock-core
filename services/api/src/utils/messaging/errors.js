class UnsubscribedError extends Error {}

class TwilioError extends Error {
  constructor(error) {
    const { code, moreInfo } = error;
    super(`${code} ${moreInfo}`);
  }
}

export { UnsubscribedError, TwilioError };
