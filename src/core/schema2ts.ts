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

    for (let i = 0; i < Object.keys(schema?.properties || {}).length; i++) {
      const key = Object.keys(schema?.properties || {})[i];
      if (opts.ignoreKeys.includes(key)) continue;

      const prop = (schema?.properties || {})[key];
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

    for (let i = 0; i < Object.keys(schema?.properties || {}).length; i++) {
      const key = Object.keys(schema?.properties || {})[i];

      if (opts.ignoreKeys.includes(key)) continue;

      const prop = (schema?.properties || {})[key];

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
