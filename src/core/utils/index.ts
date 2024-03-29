import type { IEnum, IEnumType, IJsonSchema } from "../types/schema2ts";

/** Make the first letter uppercase */
export function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Generate enum type */
export function getEnumType(enumVals: IEnum) {
  let result = "";
  const len = enumVals.length;
  for (let i = 0; i < len; i++) {
    const e = enumVals[i];

    if (typeof e === "object") {
      if (!e.value) continue;

      if (i === len - 1) {
        if ((enumVals[i + 1] as IEnumType)?.value) {
          result += `'${e?.value?.trim()}' | `;
        } else {
          result += `'${e.value.trim()}'`;
        }
      } else {
        result += `'${e.value.trim()}' | `;
      }
    } else {
      if (i === len - 1) {
        result += `'${e.trim()}'`;
      } else {
        result += `'${e.trim()}' | `;
      }
    }
  }

  return result;
}

/** Handle code indent */
export function getIndent(indent: number) {
  return "".padStart(indent, " ");
}

export function parseJson(schema: string) {
  try {
    return JSON.parse(schema);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function generateComment(schema: IJsonSchema, indent = 2) {
  let comment = "";

  if (schema.type === "array" || schema.items) {
    if (schema.title) {
      comment += schema.title;
    }
    if (schema.items?.title) {
      comment += ` ${schema.items.title}`;
    }
    if (schema.items?.description) {
      comment += ` (${schema.items?.description})`;
    }
  } else {
    if (schema.title) {
      comment += schema.title;
    }
    if (schema.description) {
      comment += ` (${schema.description})`;
    }
  }

  if (comment.length > 0) {
    return `${getIndent(indent)}/** ${comment} */\n`;
  }

  return "";
}

export function removeComment(interfaceStr = "") {
  return interfaceStr
    .split("\n")
    .map((line) => {
      return line.replace(/\s*\/\*\*(.*?)\*\/\s*/, "");
    })
    .filter((v) => v.length > 0)
    .join("\n");
}

export function checkIsValidTitle(str?: string) {
  if (!str) return false;
  return /[a-zA-Z_$]/.test(str);
}
