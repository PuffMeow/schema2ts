import { defaultOptions } from './default';
import {
  capitalize,
  checkIsValidTitle,
  generateComment,
  getEnumType,
  getIndent,
  parseJson,
  removeComment,
} from './utils';
import type { IJsonSchema, IOptions } from './types/schema2ts';

export { IOptions };

export function schema2ts(schema: string, options?: IOptions) {
  const opts = { ...defaultOptions, ...options } as Required<IOptions>;

  const jsonSchema: IJsonSchema = parseJson(schema);

  if (!jsonSchema) return opts.parseErrorMessage;

  const interfaces: string[] = [];
  const cacheTypeName = new Set<string>();

  const getType = (prop?: IJsonSchema, key?: string) => {
    const capitalizedKey = capitalize(key);

    switch (prop?.type?.toLowerCase()) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'integer':
      case 'undefined':
      case 'null':
        if (prop?.enum) {
          return `T${capitalizedKey}`;
        }
        return prop.type;
      case 'object':
        return `I${capitalizedKey}`;
      case 'array':
        return `I${capitalizedKey}[]`;
      default:
        return 'any';
    }
  };

  // From root object to generate
  const generateRootInterface = (
    schema: IJsonSchema,
    name: string = 'Schema',
  ) => {
    let interfaceStr = '';
    if (opts.isGenComment) {
      interfaceStr += `${generateComment(schema, 0)}`;
    }
    interfaceStr += `export interface I${capitalize(name)} {\n`;

    for (const key in schema.properties) {
      const prop = schema.properties[key];
      const type = getType(prop, key);
      // generate comment
      if (opts.isGenComment) {
        interfaceStr += generateComment(prop, opts.indent);
      }
      const optionalSymbol = opts.optional ? '?' : '';
      interfaceStr += `${getIndent(
        opts.indent,
      )}${key}${optionalSymbol}: ${type};\n`;
    }

    interfaceStr += `}\n`;
    return interfaceStr;
  };

  const generateEnum = (schema: IJsonSchema, key: string = 'Enum') => {
    return `export type T${capitalize(key)} = ${getEnumType(schema.enum!)};\n`;
  };

  const generateInterface = (schema: IJsonSchema, key: string = 'Schema') => {
    let interfaceStr = generateRootInterface(schema, key);

    const plainInterfaceStr = opts.isGenComment
      ? removeComment(interfaceStr)
      : interfaceStr;

    if (!cacheTypeName.has(plainInterfaceStr)) {
      cacheTypeName.add(plainInterfaceStr);

      interfaces.push(interfaceStr);
    }

    for (const key in schema.properties) {
      const prop = schema.properties[key];

      if (prop?.enum && Array.isArray(prop.enum)) {
        const enumType = generateEnum(prop, key);

        // unique the enums
        if (!cacheTypeName.has(enumType)) {
          cacheTypeName.add(enumType);
          interfaces.unshift(enumType);
        }
      }

      if (prop.properties) {
        generateInterface(prop, capitalize(key));
      }

      if (prop?.items?.properties) {
        generateInterface(prop.items, capitalize(key));
      }
    }
  };

  generateInterface(
    jsonSchema,
    checkIsValidTitle(jsonSchema?.title) ? jsonSchema.title : 'Schema',
  );

  if (options?.explain) {
    interfaces.unshift(options.explain);
  }

  let output = interfaces.join('\n');

  if (!opts.semi) {
    // remove all semicolons
    output = output.replace(/;/g, '');
  }

  return output;
}

// schema2ts(
//   `{
// "title": "Schema",
// "type": "object",
// "properties": {
//   "firstName": {
//     "title": "This is the first name",
//     "type": "string"
//   },
//   "lastName": {
//     "title": "This is the last name",
//     "type": "string"
//   },
//   "age": {
//     "title": "This is the age",
//     "type": "number"
//   },
//   "hairColor": {
//     "title": "This is the hair color",
//     "enum": [
//       {
//         "title": "hair color1",
//         "value": "color1"
//       },
//       {
//         "title": "hair color2",
//         "value": "color2"
//       },
//       {
//         "title": "hair color3",
//         "value": "color3"
//       }
//     ],
//     "type": "string"
//   },
//   "obj": {
//     "type": "object",
//     "title": "Object test",
//     "properties": {
//       "key1": {
//         "title": "This is the key1",
//         "type": "string"
//       },
//       "key2": {
//         "title": "This is the key2",
//         "type": "number"
//       },
//       "key3": {
//         "title": "This is the key3",
//         "type": "boolean"
//       }
//     }
//   },
//   "arr": {
//     "type": "array",
//     "title": "Arr test",
//     "items": {
//       "type": "object",
//       "title": "Nested array items",
//       "properties": {
//         "arr1": {
//           "title": "This is the arr1",
//           "type": "string"
//         },
//         "arr2": {
//           "title": "This is the arr2",
//           "type": "number"
//         },
//         "arr3": {
//           "type": "array",
//           "title": "Test arr3",
//           "items": {
//             "type": "object",
//             "title": "Test nested arr3 items",
//             "properties": {
//               "enen1": {
//                 "title": "This is the enen1",
//                 "type": "string"
//               },
//               "enen2": {
//                 "title": "This is the enen2",
//                 "type": "number"
//               },
//               "enen3": {
//                 "title": "This is the enen1",
//                 "type": "boolean"
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }
// }
// `,
//   { isGenComment: true },
// );
