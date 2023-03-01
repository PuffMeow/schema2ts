import { capitalize, getEnumType } from './helper';

interface IJsonSchema {
  title?: string;
  type?: string;
  properties?: { [key: string]: IJsonSchema };
  items?: IJsonSchema;
  enum?: { title?: string; value: string }[];
}

interface IOptions {
  explain?: string;
}

export function schema2ts(schema: string, options?: IOptions): string {
  const jsonSchema: IJsonSchema = JSON.parse(schema);
  const interfaces: string[] = [];
  const cacheTypeName = new Set<string>();

  const getType = (prop?: IJsonSchema, key?: string): string => {
    const capitalizedKey = capitalize(key);

    switch (prop?.type) {
      case 'string':
      case 'number':
      case 'boolean':
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

  const generateInterface = (
    schema: IJsonSchema,
    name: string = 'Schema',
  ): string => {
    let interfaceStr = `export interface I${capitalize(name)} {\n`;

    for (const key in schema.properties) {
      const prop = schema.properties[key];
      const type = getType(prop, key);
      interfaceStr += `  ${key}?: ${type};\n`;
    }

    interfaceStr += `}\n`;
    return interfaceStr;
  };

  const generateEnum = (schema: IJsonSchema, key: string = 'Enum'): string => {
    let enumStr = `export type T${capitalize(key)} = `;
    const enumValues: string[] = [];

    schema.enum?.forEach((enumValue) => {
      enumValues.push(`'${enumValue.value}'`);
    });

    enumStr += `${enumValues.join(' | ')};\n`;
    return enumStr;
  };

  const generateTypes = (schema: IJsonSchema, key: string = 'Schema'): void => {
    const interfaceName = generateInterface(schema, key);

    if (!cacheTypeName.has(interfaceName)) {
      cacheTypeName.add(interfaceName);
      interfaces.push(interfaceName);
    }

    for (const key in schema.properties) {
      const prop = schema.properties[key];

      if (prop.enum) {
        const enumType = generateEnum(prop, key);

        // unique the enums
        if (!cacheTypeName.has(enumType)) {
          cacheTypeName.add(enumType);
          interfaces.unshift(enumType);
        }
      }

      if (prop.properties) {
        generateTypes(prop, capitalize(key));
      }

      if (prop?.items?.properties) {
        generateTypes(prop.items, capitalize(key));
      }
    }
  };

  generateTypes(jsonSchema);

  if (options?.explain) {
    interfaces.unshift(options.explain);
  }

  return interfaces.join('\n');
}
