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
import { IJsonSchema, IOptions } from './types/schema2ts';

function schema2ts(schema: string, options?: IOptions) {
  const opts = { ...defaultOptions, ...options } as Required<IOptions>;

  const jsonSchema: IJsonSchema = parseJson(schema);

  if (!jsonSchema) return opts.parseErrorMessage;

  const interfaces: string[] = [];
  const cacheEnumTypes = new Set<string>();
  const enumTypeKeyNumMap = new Map<string, number>();

  const getType = (prop?: IJsonSchema, key?: string) => {
    let capitalizedKey = capitalize(key);

    switch (prop?.type?.toLowerCase()) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'integer':
      case 'undefined':
      case 'null':
        if (prop?.enum && key) {
          if (enumTypeKeyNumMap.has(key)) {
            let keyNum = enumTypeKeyNumMap.get(key) || 1;
            keyNum++;
            enumTypeKeyNumMap.set(key, keyNum);
          } else {
            enumTypeKeyNumMap.set(key, 1);
          }

          let enumType = generateEnum(prop, key);
          if (!cacheEnumTypes.has(enumType)) {
            let num = enumTypeKeyNumMap.get(key) || 1;

            if (num > 1) {
              capitalizedKey += `${num}`;
            }
          }

          return `${opts.preffixOfEnum}${capitalizedKey}`;
        }

        return prop.type;
      case 'object':
        return `${opts.preffix}${capitalizedKey}`;
      case 'array':
        return `${opts.preffix}${capitalizedKey}[]`;
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
    interfaceStr += `${opts.isExport ? 'export ' : ''}interface ${opts.preffix}${capitalize(name)} {\n`;

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

  const generateEnum = (
    schema: IJsonSchema,
    key: string = 'Enum',
    suffixNum = '',
  ) => {
    return `${opts.isExport ? 'export ' : ''}type ${opts.preffixOfEnum}${capitalize(
      key,
    )}${suffixNum} = ${getEnumType(schema.enum!)}${opts.semi ? ';' : ''}\n`;
  };

  const generateInterface = (schema: IJsonSchema, key: string = 'Schema') => {
    let interfaceStr = generateRootInterface(schema, key);

    const plainInterfaceStr = opts.isGenComment
      ? removeComment(interfaceStr)
      : interfaceStr;

    if (!cacheEnumTypes.has(plainInterfaceStr)) {
      cacheEnumTypes.add(plainInterfaceStr);

      interfaces.push(interfaceStr);
    }

    for (let i = 0; i < Object.keys(schema?.properties || {}).length; i++) {
      const key = Object.keys(schema?.properties || {})[i];

      if (opts.ignoreKeys.includes(key)) continue;

      const prop = (schema?.properties || {})[key];

      if (prop?.enum && Array.isArray(prop.enum)) {
        let enumType = generateEnum(prop, key);

        // unique the enums
        if (!cacheEnumTypes.has(enumType)) {
          let num = enumTypeKeyNumMap.get(key) || 1;

          if (num > 1) {
            enumType = generateEnum(prop, key, `${num}`);
          }

          cacheEnumTypes.add(enumType);
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

export { schema2ts, IOptions };
