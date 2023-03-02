import { defaultOptions } from './default';
import { capitalize, getEnumType, getIndent, parseJson } from './helper';
import type { IJsonSchema, IOptions } from './types/schema2ts';

export function schema2ts(schema: string, options?: IOptions) {
  const opts = { ...defaultOptions, ...options } as Required<IOptions>;
  const jsonSchema: IJsonSchema = parseJson(schema);

  if (!jsonSchema) return '// Parse schema error, please check your schema.';

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
    let interfaceStr = `export interface I${capitalize(name)} {\n`;

    for (const key in schema.properties) {
      const prop = schema.properties[key];
      const type = getType(prop, key);
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
