import { IEnumType } from './types';

/** Make the first letter uppercase */
export function toCapatical(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
