import REQUESTS from '../__fixtures__/requests.json';

export default function request(options) {
  const { method, path } = options;
  return {
    data: REQUESTS[`${method} ${path}`],
  };
}
