import { literalDeclaration } from './utils/swift';

const LAYOUT_OPTION = {
  indent: '  ',
};

export default function templateSwift({
  url,
  method,
  body,
  headers = {},
  file,
}) {
  const code = [];

  let hasHeaders = false;
  let hasBody = false;

  code.push('import Foundation');
  code.push('');

  code.push('class NetworkCaller {');
  code.push(`  let url = URL(string: "${url}")!`);
  code.push('  var dataTask: URLSessionDataTask?');

  code.push('  func networkCall() {');
  let indent = '   ';
  if (Object.keys(headers).length) {
    hasHeaders = true;
    code.push('');
    code.push(
      `${indent}${literalDeclaration('headers', headers, LAYOUT_OPTION)}`
    );
  }

  if (body && !file) {
    hasBody = true;
    code.push(
      `${indent}${literalDeclaration(
        'body',
        body,
        LAYOUT_OPTION
      )}  as [String : Any]`,
      `${indent}let postData = try JSONSerialization.data(withJSONObject: body, options: [])`
    );
  }

  code.push(
    '',
    `${indent}var request = URLRequest(url: url)`,
    `${indent}request.httpMethod = "${method}"`
  );

  if (hasHeaders) {
    code.push(`${indent}request.allHTTPHeaderFields = headers`);
  }

  if (file) {
    code.push(`${indent}let boundary = UUID().uuidString`);
    code.push(
      `${indent}request.setValue("multipart/form-data; boundary=\\(boundary)", forHTTPHeaderField: "Content-Type")`
    );

    code.push('');

    code.push(`${indent}let minetype = "image/png"`);
    code.push(`${indent}let fileName = "name-of-file.png"`);
    code.push(`${indent}let imageData = "The string" //your image data`);
    code.push(`${indent}let fileData = Data(imageData.utf8)`);

    code.push('');
    code.push(`${indent}// Add the image data to the raw http request data`);
    code.push(`${indent}var data = Data()`);

    Object.keys(body || {}).map((key) => {
      code.push(
        `${indent}data.append("\\r\\n--\\(boundary)\\r\\n".data(using: .utf8)!)`,
        `${indent}data.append("Content-Disposition: form-data; name=\\"${key}"\\r\\n\\r\\n".data(using: .utf8)!)`,
        `${indent}data.append("${body[key]}".data(using: .utf8)!)`
      );
    });

    code.push(
      `${indent}data.append("\\r\\n--\\(boundary)\\r\\n".data(using: .utf8)!)`,
      `${indent}data.append("Content-Disposition: form-data; name=\\"file\\"; filename=\\"\\(fileName)\\"\\r\\n".data(using: .utf8)!)`,
      `${indent}data.append("Content-Type: \\(minetype)\\r\\n\\r\\n".data(using: .utf8)!)`
    );

    code.push(`${indent}data.append(fileData)`);
    code.push('');
    code.push(
      `${indent}data.append("\\r\\n--\\(boundary)--\\r\\n".data(using: .utf8)!)`
    );
    code.push('');
    code.push('request.httpBody = data');
  }

  if (hasBody) {
    code.push('request.httpBody = postData as Data');
  }

  code.push(
    '',
    `${indent}let session = URLSession.shared`,
    `${indent}dataTask = session.dataTask(with: request, completionHandler: { responseData, response, error in `,
    `${indent}  if let error = error {`,
    `${indent}    print(error)`,
    `${indent}    return`,
    `${indent}  }`,
    '',
    `${indent}  print("Responsed with http status", (response as! HTTPURLResponse).statusCode)`,
    `${indent}  print("Responsed body:")`,
    '',
    `${indent}  let jsonData = try? JSONSerialization.jsonObject(with: responseData!, options: .allowFragments)`,
    `${indent}  if let json = jsonData as? [String: Any] {`,
    `${indent}     print(json)`,
    `${indent}  }`,
    `${indent}})`,
    '',
    `${indent}dataTask?.resume()`
  );
  code.push('  }');
  code.push('}');

  return code.join('\n');
}
