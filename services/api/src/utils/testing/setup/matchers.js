function toHaveStatus(response, status) {
  const pass = response.status === status;
  const { printExpected, printReceived } = this.utils;
  const expected = printExpected(status);
  const received = printReceived(response.status);

  if (pass) {
    return {
      pass: true,
      message: () => `expected a status of ${expected}`,
    };
  } else {
    return {
      pass: false,
      message: () => {
        return `
Status: ${received}

${JSON.stringify(response.body, null, 2)}
        `.trim();
      },
    };
  }
}

expect.extend({ toHaveStatus });
