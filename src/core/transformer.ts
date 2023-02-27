import { capitalize, getEnumType } from './helper';

export function schema2ts(schema: string | Record<string, any>): string {
  let schemaToTransform: string | Record<string, any> = schema;
  if (typeof schemaToTransform === 'string') {
    try {
      schemaToTransform = JSON.parse(schemaToTransform);
    } catch (e) {
      console.error(`Transform Error: ${e}`);
      return '';
    }
  }

  return transformer(schemaToTransform as Record<string, any>);
}

const keysSet = new Set<string>();
const enums: string[] = [];
const innerProperties: string[] = [];

let output = '';

function transformer(schema: Record<string, any>): string {
  const rootKey = `${schema?.title ?? 'Schema'}`;

  if (!schema?.properties) {
    return `I${rootKey} {}`;
  }

  output += `
export interface I${rootKey} {\n`;

  output += handleProperties(schema.properties);

  output += '}\n';

  handleReferenceType(schema.properties);

  // handle enums
  enums.forEach((enumType) => {
    output = enumType + output;
  });

  return output;
}

function handleReferenceType(properties: Record<string, any>) {
  Object.keys(properties ?? {}).forEach((key) => {
    const val: Record<string, any> = properties[key];

    if (val.type === 'object' && val.properties) {
      output += `\nexport interface I${capitalize(key)} {\n`;
      output += handleProperties(val.properties);
      output += '}\n';
    }

    if (val.type === 'array' && val.items) {
      output += `\nexport interface I${capitalize(key)} {\n`;
      output += handleProperties(val?.items?.properties);
      output += '}\n';

      // Object.keys(val?.items?.properties ?? {}).forEach((innerKey) => {
      //   const innerVal = val.items?.properties[innerKey];
      //   if (
      //     (innerVal.type === 'object' && innerVal.properties) ||
      //     (innerVal.type === 'array' && innerVal.items)
      //   ) {
      //     output += handleProperties(innerVal.items.properties);
      //   }
      // });
    }
  });
}

function handleProperties(properties: Record<string, any>) {
  let propertiesOutput = '';

  Object.keys(properties).forEach((key) => {
    const prop: Record<string, any> = properties?.[key];
    switch (prop.type.toLowerCase()) {
      case 'string': {
        if (prop?.enum?.length) {
          const enumType = `T${capitalize(key)}`;
          propertiesOutput += `  ${key}?: ${enumType};\n`;
          enums.push(`export type ${enumType} = ${getEnumType(prop.enum)};\n`);
        } else {
          propertiesOutput += `  ${key}?: string;\n`;
        }
        break;
      }
      case 'number' || 'integer': {
        propertiesOutput += `  ${key}?: number;\n`;
        break;
      }
      case 'boolean': {
        propertiesOutput += `  ${key}?: boolean;\n`;
        break;
      }
      case 'object': {
        const typeName = `I${capitalize(key)}`;
        propertiesOutput += `  ${key}?: ${typeName};\n`;
        break;
      }
      case 'array': {
        propertiesOutput += `  ${key}?: I${capitalize(key)}[];\n`;
        break;
      }
      default:
        break;
    }
  });

  return propertiesOutput;
}

console.log(
  transformer({
    title: 'Schema',
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      hairColor: {
        enum: [
          {
            title: '头发颜色1',
            value: 'color1',
          },
          {
            title: '头发颜色2',
            value: 'color2',
          },
        ],
        type: 'string',
      },
      arr: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            arr1: {
              type: 'string',
            },
            arr2: {
              type: 'number',
            },
            arr3: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  enen1: {
                    type: 'string',
                  },
                  enen2: {
                    type: 'number',
                  },
                  enen3: {
                    type: 'boolean',
                  },
                },
              },
            },
          },
        },
      },
      obj: {
        type: 'object',
        properties: {
          key1: {
            type: 'string',
          },
          key2: {
            type: 'number',
          },
          key3: {
            type: 'boolean',
          },
        },
      },
    },
  }),
);
