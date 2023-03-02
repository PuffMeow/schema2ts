import { IEnumType } from './types/schema2ts';

/** Make the first letter uppercase */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Generate enum type */
export function getEnumType(enumVals: IEnumType[]) {
  const enums = Object.values(enumVals);
  let result = '';
  const len = enums.length;
  for (let i = 0; i < len; i++) {
    const e = enums[i];
    if (!e.value) continue;

    if (i === len - 1) {
      if (enums[i + 1]?.value) {
        result += `'${e?.value?.trim()}' | `;
      } else {
        result += `'${e.value.trim()}'`;
      }
    } else {
      result += `'${e.value.trim()}' | `;
    }
  }

  return result;
}

/** Handle code indent */
export function getIndent(indent: number) {
  return ''.padStart(indent, ' ');
}

export function parseJson(schema: string) {
  try {
    return JSON.parse(schema);
  } catch (e) {
    console.error(e);
    return null;
  }
}
