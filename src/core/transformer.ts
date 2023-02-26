export function transformer(schema: string | Record<string, any>): string {
  let schemaToTransform: string | Record<string, any> = schema;
  if (typeof schemaToTransform === "string") {
    try {
      schemaToTransform = JSON.parse(schemaToTransform);
    } catch (e) {
      console.error(`Transform Error: ${e}`);
      return "";
    }
  }

  return schema2ts(schemaToTransform as Record<string, any>);
}

function schema2ts(schema: Record<string, any>): string {
  return "";
}
