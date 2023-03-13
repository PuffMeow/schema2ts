import { defaultOptions } from './default';
import {
  capitalize,
  generateComment,
  getEnumType,
  getIndent,
  parseJson,
  removeComment,
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
      // generate comment
      if (opts.isGenComment) {
        interfaceStr += generateComment(prop, opts.indent);
      }
      const optionalSymbol = opts.optional ? '?' : ''
      interfaceStr += `${getIndent(opts.indent)}${key}${optionalSymbol}: ${type};\n`;
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
    let interfaceStr = generateRootInterface(schema, key);

    if (!cacheTypeName.has(interfaceStr)) {
      // remove the comment when caching
      if (opts?.isGenComment) {
        interfaceStr = removeComment(interfaceStr);
      }
      cacheTypeName.add(interfaceStr);

      interfaces.push(interfaceStr);
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
      "title": "头发颜色",
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
      "title": "对象测试",
      "properties": {
        "key1": {
          "title": "key1",
          "type": "string"
        },
        "key2": {
          "title": "key2",
          "type": "number"
        },
        "key3": {
          "title": "key3",
          "type": "boolean"
        }
      }
    },
    "arr": {
      "type": "array",
      "title": "数组测试",
      "items": {
        "type": "object",
        "title": "嵌套数组",
        "properties": {
          "arr1": {
            "title": "arr1",
            "type": "string"
          },
          "arr2": {
            "title": "arr2",
            "type": "number"
          },
          "arr3": {
            "type": "array",
            "title": "测试 arr3",
            "items": {
              "type": "object",
              "title": "测试 arr3 items",
              "properties": {
                "enen1": {
                  "title": "嗯嗯1",
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
