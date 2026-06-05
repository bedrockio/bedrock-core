import PropTypes from 'prop-types';
import { useState } from 'react';

import Code from 'components/Code';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { API_URL } from 'utils/env';

import templateCurl from './templates/curl';
import templateFetch from './templates/fetch';
import templateSwift from './templates/swift';

const TEMPLATES = {
  curl: templateCurl,
  fetch: templateFetch,
  swift: templateSwift,
};

const OPTIONS = [
  {
    value: 'curl',
    label: 'cURL',
    language: 'bash',
  },
  {
    value: 'fetch',
    label: 'Fetch',
    language: 'js',
  },
  {
    value: 'swift',
    label: 'Swift',
    language: 'swift',
  },
];

/**
 * Component that displays API request examples in different languages.
 *
 * @param {Object} props - Component props
 * @returns {JSX.Element} RequestBlock component
 */
function RequestBlock(props) {
  const {
    header = false,
    selector = true,
    template = 'curl',
    baseUrl = API_URL,
    authToken,
    apiKey,
    request,
  } = props;

  const [current, setCurrent] = useState(template);

  function getDefaultHeaders() {
    const headers = {
      'Api-Key': `${apiKey || '<apiKey>'}`,
      ...props.headers,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (request?.body && !request?.file) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  function getData() {
    const { path, ...rest } = request;
    return {
      ...rest,
      url: baseUrl ? `${baseUrl}${path}` : path,
      headers: getDefaultHeaders(),
    };
  }

  const option = OPTIONS.find((c) => c.value === current);
  const { method, path } = request;
  const templateFunction = TEMPLATES[current];

  return (
    <>
      {(header || selector) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {header && (
            <h4 className="m-0 text-base font-semibold">
              {method} {path}
            </h4>
          )}
          {selector && (
            <Select value={current} onValueChange={setCurrent}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      <Code language={option.language}>{templateFunction(getData())}</Code>
    </>
  );
}

RequestBlock.propTypes = {
  height: PropTypes.string,
  apiKey: PropTypes.string,
  authToken: PropTypes.string,
  baseUrl: PropTypes.string,
  header: PropTypes.bool,
  template: PropTypes.string,
  selector: PropTypes.bool,
  headers: PropTypes.object,
  request: PropTypes.shape({
    path: PropTypes.string.isRequired,
    method: PropTypes.oneOf(['POST', 'GET', 'PATCH', 'DELETE', 'PUT'])
      .isRequired,
    body: PropTypes.object,
    headers: PropTypes.object,
    file: PropTypes.object,
  }).isRequired,
};

export default RequestBlock;
