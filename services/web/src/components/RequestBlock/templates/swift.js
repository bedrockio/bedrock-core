import { literalDeclaration } from './utils/swift';

const LAYOUT_OPTION = {
  indent: '  ',
};

/*
func uploadImage(paramName: String, fileName: String, image: UIImage) {
  let url = URL(string: "http://api-host-name/v1/api/uploadfile/single")

  // generate boundary string using a unique per-app string
  let boundary = UUID().uuidString
  let session = URLSession.shared

  // Set the URLRequest to POST and to the specified URL
  var urlRequest = URLRequest(url: url!)
  urlRequest.httpMethod = "POST"

  // Set Content-Type Header to multipart/form-data, this is equivalent to submitting form data with file upload in a web browser
  // And the boundary is also set here
  urlRequest.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

  var data = Data()

  // Add the image data to the raw http request data
  data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
  data.append("Content-Disposition: form-data; name=\"\(paramName)\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
  data.append("Content-Type: image/png\r\n\r\n".data(using: .utf8)!)
  data.append(image.pngData()!)

  data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

  // Send a POST request to the URL, with the data we created earlier
  session.uploadTask(with: urlRequest, from: data, completionHandler: { responseData, response, error in
      if error == nil {
          let jsonData = try? JSONSerialization.jsonObject(with: responseData!, options: .allowFragments)
          if let json = jsonData as? [String: Any] {
              print(json)
          }
      }
  }).resume()
}
*/

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

  code.push(`let url = URL(string: "${url}")`);

  if (Object.keys(headers).length) {
    hasHeaders = true;
    code.push('');
    code.push(literalDeclaration('headers', headers, LAYOUT_OPTION));
  }

  if (body && !file) {
    hasBody = true;
    code.push(
      `${literalDeclaration('body', body, LAYOUT_OPTION)}  as [String : Any]`,
      'let postData = try JSONSerialization.data(withJSONObject: body, options: [])'
    );
  }

  code.push(
    '',
    'var request = URLRequest(url: url!)',
    `request.httpMethod = "${method}"`
  );

  if (hasHeaders) {
    code.push('request.allHTTPHeaderFields = headers');
  }

  if (file) {
    code.push('let boundary = UUID().uuidString');
    code.push(
      'request.setValue("multipart/form-data; boundary=\\(boundary)", forHTTPHeaderField: "Content-Type")'
    );

    code.push('');
    code.push('var data = Data()');
    code.push('let minetype = "image/png"');
    code.push('let fileName = "name-of-file.png"');
    code.push('let string = "The string"');
    code.push('let fileData = Data(string.utf8)');

    /*
    // Add the reqtype field and its value to the raw http request data
    data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
    data.append("Content-Disposition: form-data; name=\"\(fieldName)\"\r\n\r\n".data(using: .utf8)!)
    data.append("\(fieldValue)".data(using: .utf8)!)
    */

    code.push('// Add the image data to the raw http request data');
    code.push('data.append("\\r\\n--\\(boundary)\\r\\n".data(using: .utf8)!)');
    code.push(
      'data.append("Content-Disposition: form-data; name=\\"file\\"; filename=\\"\\(fileName)\\"\\r\\n".data(using: .utf8)!)'
    );
    code.push(
      'data.append("Content-Type: \\(minetype)\\r\\n\\r\\n".data(using: .utf8)!)'
    );

    code.push('data.append(fileData)');
    code.push('');

    code.push(
      'data.append("\\r\\n--\\(boundary)--\\r\\n".data(using: .utf8)!)'
    );
    code.push('request.httpBody = data');
  }

  if (hasBody) {
    code.push('request.httpBody = postData as Data');
  }

  code.push(
    '',
    'let session = URLSession.shared',
    'let dataTask = session.dataTask(with: request, completionHandler: { responseData, response, error in ',
    '  if (error != nil) {',
    '    print(error)',
    '    return',
    '  }',
    '',
    '  print("Responsed with http status", (response as! HTTPURLResponse).statusCode)',
    '  print("Responsed body:")',
    '',
    '  let jsonData = try? JSONSerialization.jsonObject(with: responseData!, options: .allowFragments)',
    '  if let json = jsonData as? [String: Any] {',
    '    print(json)',
    '  }',
    '}).resume()'
  );

  return code.join('\n');
}
