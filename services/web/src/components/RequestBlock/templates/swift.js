import { API_URL } from 'utils/env';
import { literalDeclaration } from './utils/swift';

const LAYOUT_OPTION = {
  indent: '  ',
};

export default function templateSwift({ url, method, body, headers = {} }) {
  const code = [];

  let hasHeaders = false;
  let hasBody = false;

  code.push('import Foundation');

  if (Object.keys(headers).length) {
    hasHeaders = true;
    code.push('');
    code.push(literalDeclaration('headers', headers, LAYOUT_OPTION));
  }

  if (body) {
    hasBody = true;
    code.push(
      `${literalDeclaration(
        'parameters',
        body,
        LAYOUT_OPTION
      )}  as [String : Any]`,
      '',
      'let postData = JSONSerialization.data(withJSONObject: parameters, options: [])'
    );
  }

  code.push(
    '',
    `let request = NSMutableURLRequest(url: NSURL(string: "${url}")! as URL,`,
    '                                        cachePolicy: .useProtocolCachePolicy,',
    '                                    timeoutInterval: 30)',
    `request.httpMethod = "${method}"`
  );

  if (hasHeaders) {
    code.push('request.allHTTPHeaderFields = headers');
  }

  if (hasBody) {
    code.push('request.httpBody = postData as Data');
  }

  code.push(
    '',
    'let session = URLSession.shared',
    'let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in',
    '  if (error != nil) {',
    '    print(error)',
    '  } else {',
    '    let httpResponse = response as? HTTPURLResponse',
    '    print(httpResponse)',
    '  }',
    '})',
    '',
    'dataTask.resume()'
  );

  return code.join('\n');
}
