const sleep = (ms) => {
  return new Promise((r) => setTimeout(r, ms));
};

export { sleep };
