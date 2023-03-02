import { defaultOptions } from './default';
import {
  capitalize,
  generateComment,
  getEnumType,
  getIndent,
  parseJson,
} from './utils';
import type { IJsonSchema, IOptions } from './types/schema2ts';

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

  const generateRootInterface = (
    schema: IJsonSchema,
    name: string = 'Schema',
  ) => {
    let interfaceStr = '';
    interfaceStr = `export interface I${capitalize(name)} {\n`;

    for (const key in schema.properties) {
      const prop = schema.properties[key];
      const type = getType(prop, key);
      if (opts.isGenComment) {
        interfaceStr += generateComment(prop, opts.indent);
      }
      interfaceStr += `${getIndent(opts.indent)}${key}?: ${type};\n`;
    }

    interfaceStr += `}\n`;
    return interfaceStr;
  };

  const generateEnum = (schema: IJsonSchema, key: string = 'Enum') => {
    return `export type T${capitalize(key)} = ${getEnumType(
      schema?.enum ?? [],
    )};\n`;
  };

  const generateNestedInterface = (
    schema: IJsonSchema,
    key: string = 'Schema',
  ) => {
    const interfaceName = generateRootInterface(schema, key);

    if (!cacheTypeName.has(interfaceName)) {
      // TODO: 添加缓存的时候记得把注释删掉
      cacheTypeName.add(interfaceName);
      interfaces.push(interfaceName);
    }

    for (const key in schema.properties) {
      const prop = schema.properties[key];

      if (prop?.enum) {
        const enumType = generateEnum(prop, key);

        // unique the enums
        if (!cacheTypeName.has(enumType)) {
          cacheTypeName.add(enumType);
          interfaces.unshift(enumType);
        }
      }

      if (prop.properties) {
        generateNestedInterface(prop, capitalize(key));
      }

      if (prop?.items?.properties) {
        generateNestedInterface(prop.items, capitalize(key));
      }
    }
  };

  generateNestedInterface(jsonSchema);

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

console.log(
  schema2ts(`{
  "title": "Schema",
  "type": "object",
  "properties": {
    "firstName": {
      "title": "第一名",
      "type": "string"
    },
    "lastName": {
      "title": "第二名",
      "type": "string"
    },
    "age": {
      "title": "年龄",
      "type": "number"
    },
    "hairColor": {
      "enum": [
        {
          "title": "头发颜色1",
          "value": "color1"
        },
        {
          "title": "头发颜色2",
          "value": "color2"
        },
        {
          "title": "头发颜色3",
          "value": "color3"
        }
      ],
      "type": "string"
    },
    "obj": {
      "type": "object",
      "properties": {
        "key1": {
          "type": "string"
        },
        "key2": {
          "type": "number"
        },
        "key3": {
          "type": "boolean"
        }
      }
    },
    "arr": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "arr1": {
            "type": "string"
          },
          "arr2": {
            "type": "number"
          },
          "arr3": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "enen1": {
                  "type": "string"
                },
                "enen2": {
                  "type": "number"
                },
                "enen3": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    }
  }
}
`),
);
