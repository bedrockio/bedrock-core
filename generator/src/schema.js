const { yellow } = require('kleur');
const { parseDate } = require('./date');
const { block, indent } = require('./util');
const prompt = require('./prompt');
const {
  validateDate,
  validateString,
  validateNumber,
  validateRegExp,
  validateBoolean,
  validateCamelUpper
} = require('./validations');

let initialBuild = false;

const SCHEMA_TYPES = [
  {
    title: 'String',
    value: 'String',
  },
  {
    title: 'Text',
    value: 'Text',
    description: 'Same as String but generates <textfield>',
  },
  {
    title: 'Number',
    value: 'Number',
  },
  {
    title: 'Boolean',
    value: 'Boolean',
  },
  {
    title: 'ObjectId',
    value: 'ObjectId',
  },
  {
    title: 'Upload',
    value: 'Upload',
    description: "Shortcut for { type: ObjectId, ref: 'Upload' }",
  },
  {
    title: 'Date',
    value: 'Date',
  },
  {
    title: 'Array (String)',
    value: 'StringArray',
  },
  {
    title: 'Array (ObjectId)',
    value: 'ObjectIdArray',
  },
  {
    title: 'Array (Upload)',
    value: 'UploadArray',
    description: "Shortcut for [{ type: ObjectId, ref: 'Upload' }]",
  },
];

const SCHEMA_OPTIONS = [
  {
    title: 'required',
    value: 'required',
    selected: false,
  },
  {
    title: 'private',
    value: 'private',
    selected: false,
  },
  {
    title: 'trim',
    value: 'trim',
    selected: true,
    types: ['String', 'StringArray'],
  },
  {
    title: 'enum',
    value: 'enum',
    selected: false,
    types: ['String', 'Number'],
    prompt: {
      type: 'list',
      message: 'Allowed values (comma separated):',
      validate: validateString,
    },
  },
  {
    title: 'default',
    value: 'default',
    selected: false,
    prompt: {
      type: 'text',
      message: 'Default value:',
      validate: validateDefault,
    },
    types: ['String', 'Number', 'Boolean', 'Date'],
  },
  {
    title: 'minlength',
    value: 'minlength',
    selected: false,
    types: ['String'],
    prompt: {
      type: 'text',
      message: 'Minimum length:',
      validate: validateNumber,
    },
  },
  {
    title: 'maxlength',
    value: 'maxlength',
    selected: false,
    types: ['String'],
    prompt: {
      type: 'text',
      message: 'Maximum length:',
      validate: validateNumber,
    },
  },
  {
    title: 'match',
    value: 'match',
    selected: false,
    types: ['String', 'StringArray'],
    prompt: {
      type: 'text',
      message: 'Regex for match:',
      validate: validateRegExp,
    },
  },
  {
    title: 'integer',
    value: 'integer',
    selected: false,
    types: ['Number'],
    description: 'Creates an integer validator. Usually excessive.',
  },
  {
    title: 'min',
    value: 'min',
    selected: false,
    types: ['Number', 'Date'],
    prompt: {
      type: 'text',
      message: 'Minimum value:',
      validate: validateMixed,
    },
  },
  {
    title: 'max',
    value: 'max',
    selected: false,
    types: ['Number', 'Date'],
    prompt: {
      type: 'text',
      message: 'Maximum value:',
      validate: validateMixed,
    },
  },
  {
    title: 'autopopulate',
    value: 'autopopulate',
    selected: true,
    types: ['ObjectId', 'ObjectIdArray', 'Upload', 'UploadArray'],
  },
  {
    title: 'unique',
    value: 'unique',
    selected: false,
  },
  {
    title: 'index',
    value: 'index',
    selected: false,
  },
];

function toCode(str, type) {
  switch (type) {
    case 'String':
      return `'${str}'`;
    case 'Number':
    case 'Boolean':
      return str;
    case 'Date':
      if (str === 'now') {
        return 'Date.now';
      } else {
        return `Date.parse('${parseDate(str).toISOString()}')`;
      }
  }
}

function enumToCode(arr, type) {
  arr = arr.map((el) => toCode(el, type));
  return `[${arr.join(', ')}]`;
}

function validateDefault(str, type, options) {
  if (options['enum'] && !options['enum'].includes(str)) {
    return 'Default value must be included in enum.';
  }
  return validateMixed(str, type);
}

function validateMixed(str, type) {
  switch (type) {
    case 'String':
      return validateString(str);
    case 'Number':
      return validateNumber(str);
    case 'Boolean':
      return validateBoolean(str);
    case 'Date':
      return validateDate(str);
  }
}

async function getSchema(fields = []) {
  initialBuild = fields.length > 0;
  let action;
  while (action !== 'build') {
    if (fields.length) {
      let source = outputSchema(fields);
      console.log(yellow(`Building Schema:\n{\n${indent(source, 2)}\n}`));
    } else {
      console.log(yellow('Create Schema:'));
    }
    action = await getAction(fields);
    if (action === 'add') {
      fields.push(await getField({}, fields.length));
    } else if (action === 'remove') {
      fields.splice(await getFieldIndex(fields), 1);
    } else if (typeof action === 'number') {
      fields.splice(action, 1, await getField(fields[action], fields.length));
    }
  }
  console.log(yellow('Schema built!'));
  return fields;
}

async function getAction(fields) {
  return await prompt({
    type: 'select',
    message: '',
    choices: [
      ...fields.map((field, i) => {
        const { name } = field;
        return {
          title: `Edit "${name}"`,
          value: i,
        };
      }),
      { title: 'Add Field', value: 'add' },
      ...(fields.length
        ? [
            { title: 'Remove Field', value: 'remove' },
            { title: 'Build Schema', value: 'build' },
          ]
        : []),
    ],
    initial: getInitialAction(fields),
    hint: 'Select Action',
  });
}

function getInitialAction(fields) {
  if (initialBuild) {
    initialBuild = false;
    return fields.length + 2;
  } else {
    return fields.length;
  }
}

async function getField(field) {
  const { name, type } = await prompt([
    {
      type: 'text',
      name: 'name',
      initial: field.name,
      validate: (name) => {
        if (!name) {
          return 'Enter valid name';
        }
        return true;
      },
      message: 'Field Name:',
    },
    {
      type: 'select',
      name: 'type',
      message: 'Field Type:',
      choices: SCHEMA_TYPES,
      initial: getInitialType(field),
      hint: 'Select One',
    },
  ]);

  if (type !== field.type) {
    // Reset field if the type changes
    // so the options don't persist.
    field = {};
  }

  let ref;
  let schemaType = type;

  if (schemaType.match(/Array/)) {
    schemaType = schemaType.replace(/Array/, '');
  }

  if (schemaType === 'Text') {
    schemaType = 'String';
  } else if (schemaType === 'Upload') {
    schemaType = 'ObjectId';
    ref = 'Upload';
  } else if (schemaType === 'ObjectId') {
    ref = await prompt({
      type: 'text',
      message: 'Ref (ex. UserImage):',
      validate: validateCamelUpper,
    });
  }

  const options = await getFieldOptions(type, field);

  return {
    ref,
    name,
    type,
    schemaType,
    ...options,
  };
}

async function getFieldOptions(type, field) {
  const options = {};
  const selected = await prompt({
    type: 'multiselect',
    instructions: false,
    message: 'Field Options:',
    choices: SCHEMA_OPTIONS.filter((obj) => {
      return !obj.types || obj.types.includes(type);
    }).map((obj) => {
      let selected = obj.value in field || obj.selected;
      let value = obj;
      return {
        ...obj,
        value,
        selected,
      };
    }),
    hint: 'Space to select',
  });

  for (let obj of selected) {
    if (obj.prompt) {
      const val = field[obj.value];
      options[obj.value] = await prompt({
        ...obj.prompt,
        initial: () => {
          if (val && Array.isArray(val)) {
            return val.join(', ');
          } else if (val) {
            return val;
          } else if (type === 'Date') {
            return 'now';
          }
        },
        validate: (val) => {
          const { validate } = obj.prompt;
          return validate ? validate(val, type, options) : true;
        },
      });
    } else {
      options[obj.value] = true;
    }
  }

  return options;
}

async function getFieldIndex(fields) {
  return await prompt({
    type: 'select',
    message: 'Field',
    choices: [
      ...fields.map((field, i) => {
        const { name } = field;
        return {
          title: `Remove "${name}"`,
          value: i,
        };
      }),
    ],
    initial: 0,
    hint: 'Select',
  });
}

function getInitialType(field) {
  const idx = SCHEMA_TYPES.findIndex((t) => {
    return t.value === field.type;
  });
  return idx === -1 ? 0 : idx;
}

function outputSchema(fields) {
  return fields
    .map((field) => {
      if (field.type.match(/Array/)) {
        return outputArrayField(field);
      } else {
        return outputField(field);
      }
    })
    .join('\n');
}

function outputField(field) {
  return block`
    ${field.name}: {
      ${outputFieldOptions(field)}
    },
  `;
}

function outputArrayField(field) {
  return block`
    ${field.name}: [{
      ${outputFieldOptions(field)}
    }],
  `;
}

function outputFieldOptions(field) {
  const { schemaType: type } = field;
  return `
      type: ${type},
      ${field.ref ? `ref: '${field.ref}',` : ''}
      ${field.trim ? 'trim: true,' : ''}
      ${field.required ? 'required: true,' : ''}
      ${field.default ? `default: ${toCode(field.default, type)},` : ''}
      ${field.enum ? `enum: ${enumToCode(field.enum, type)},` : ''}
      ${field.min ? `min: ${toCode(field.min, type)},` : ''}
      ${field.max ? `max: ${toCode(field.max, type)},` : ''}
      ${field.match ? `match: ${field.match},` : ''}
      ${field.minlength ? `minlength: ${field.minlength},` : ''}
      ${field.maxlength ? `maxlength: ${field.maxlength},` : ''}
      ${field.private ? "access: 'private'," : ''}
      ${field.unique ? 'unique: true,' : ''}
      ${field.index ? 'index: true,' : ''}
      ${outputFieldInteger(field) || ''}
      ${field.autopopulate ? 'autopopulate: true,' : ''}
  `;
}

function outputFieldInteger(field) {
  if (field.integer) {
    return `
      validate : {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
    `;
  }
}

module.exports = {
  getSchema,
  outputSchema,
};
