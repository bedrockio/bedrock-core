import { get, set } from 'lodash';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseLines(text) {
  return text
    .replace(/\r/gm, '\n')
    .replace(/\n\n/gm, '\n')
    .split('\n')
    .filter((line) => line.length);
}

export function parseColumns(headerLine) {
  return headerLine
    .replace(/[\n\r]+/g, '')
    .split(/,/)
    .map((k) => k.replace(/"\s/g, ''))
    .filter((k) => k !== '');
}

export function parseType(type, rawValue) {
  if (type === 'europeanNumber') {
    return parseFloat(rawValue.replace(/\./g, '').replace(/,/, '.'), 10);
  }
  if (type === 'europeanOrAmericanNumber') {
    if (rawValue.match(/\./)) {
      if (rawValue.match(/,/)) {
        throw new Error(
          'Could not autodetect european or american number format for kwh'
        );
      }
      return parseFloat(rawValue, 10);
    }
    return parseFloat(rawValue.replace(/\./g, '').replace(/,/, '.'), 10);
  }
  if (type === 'datetime') {
    return new Date(Date.parse(rawValue)).toISOString();
  }
  if (type === 'duration') {
    // 07:45:12
    const value = rawValue.split(':');
    if (value.length !== 3) {
      throw new Error(`Unknown duration format: "${rawValue}"`);
    }
    return (
      parseInt(value[0], 10) * 3600 +
      parseInt(value[1], 10) * 60 +
      parseInt(value[2], 10)
    );
  }
}

function csvTextToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ',';

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    '(\\' +
      strDelimiter +
      '|\\r?\\n|\\r|^)' +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      '\\r\\n]*))',
    'gi'
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}

export function matchColumns(columnMapping, fields) {
  const mapping = {};
  Object.keys(columnMapping).forEach((key) => {
    const configuration = columnMapping[key];
    const result = {
      destinationColumn: null,
      destinationIndex: -1,
      ...configuration,
    };
    for (let i = 0; fields.length > i; i += 1) {
      const field = fields[i];
      if (!field || !field.length) {
        continue;
      }
      if (
        configuration.exactMatches &&
        configuration.exactMatches.includes(field)
      ) {
        result.destinationColumn = field;
        result.destinationIndex = i;
        break;
      }
      if (configuration.matches) {
        let hasMatch = false;
        for (let j = 0; configuration.matches.length > j; j += 1) {
          const match = configuration.matches[j];
          if (field.includes(match)) {
            result.destinationIndex = i;
            result.destinationColumn = field;
            hasMatch = true;
            break;
          }
        }
        if (hasMatch) {
          break;
        }
      }
    }
    if (configuration.required && !result.destinationColumn) {
      let examples = [];
      if (configuration.matches) {
        examples = examples.concat(configuration.matches);
      }
      if (configuration.exactMatches) {
        examples = examples.concat(configuration.exactMatches);
      }
      throw new Error(
        `Could not find required column ${key} (${examples.join(', ')})`
      );
    }
    mapping[key] = result;
  });
  return mapping;
}

export function createItems(lines, mapping) {
  return lines.map((line) => {
    const object = {};
    Object.keys(mapping).forEach((key) => {
      let value = mapping[key].defaultValue;
      if (mapping[key].destinationColumn) {
        value = line[mapping[key].destinationIndex] || value;
      }
      if (mapping[key].parseFn) {
        value = mapping[key].parseFn(value, line);
      } else if (mapping[key].type) {
        value = parseType(mapping[key].type, value);
      }
      set(object, key, value);
    });
    return object;
  });
}

export function processText(columnMapping, text) {
  const sheet = csvTextToArray(text).filter(
    (row) => !(row.length === 1 && row[0] === '')
  );
  const mapping = matchColumns(columnMapping, sheet[0]);
  const items = createItems(sheet.slice(1), mapping);
  const numColumnsMatched = Object.keys(mapping).reduce((total, key) => {
    return mapping[key].destinationColumn ? total + 1 : total;
  }, 0);
  return {
    items,
    mapping,
    numColumnsMatched,
  };
}

export function processFile(columnMapping, file) {
  return new Promise((accept, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = processText(columnMapping, reader.result);
        setTimeout(() => {
          accept(result);
        }, 1000);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}

function getDeepKeys(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
    if (typeof obj[key] === 'object') {
      var subkeys = getDeepKeys(obj[key]);
      keys = keys.concat(
        subkeys.map(function (subkey) {
          return key + '.' + subkey;
        })
      );
    }
  }
  return keys;
}

function autoFormatCell(key) {
  return (object) => {
    const value = get(object, key);
    if (value instanceof Date) {
      return `${
        value.getMonth() + 1
      }/${value.getDate()}/${value.getFullYear()} ${value.getHours()}:${value.getMinutes()}:${value.getSeconds()}`;
    }
    return value;
  };
}

// There is no spoon!
function generateExportMapping(data) {
  const mapping = {};
  const sample1 = data[0];
  const sample2 = data[data.length - 1];
  const deepKeys = getDeepKeys({ ...sample1, ...sample2 });
  const rootKeys = [];
  deepKeys.forEach((key) => {
    const path = key.split('.');
    if (path.length > 1) {
      rootKeys.push(path.slice(0, path.length - 1).join('.'));
    }
  });
  deepKeys.forEach((key) => {
    if (!rootKeys.includes(key)) {
      mapping[key] = autoFormatCell(key);
    }
  });
  return mapping;
}

export function downloadCsv(data, mapping = null, filename = 'export.csv') {
  let csvContent = 'data:text/csv;charset=utf-8,';
  if (!mapping) {
    mapping = generateExportMapping(data);
  }
  csvContent += `${Object.keys(mapping).join(',')}\r\n`;
  csvContent += data
    .map((row) => {
      return Object.keys(mapping)
        .map((key) => {
          const fn = mapping[key];
          return fn(row);
        })
        .join(',');
    })
    .join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  link.innerHTML = `Download ${filename}`;
  document.body.appendChild(link);
  link.click();
}
