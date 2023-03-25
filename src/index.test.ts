import { describe, expect, test } from 'vitest';
import schema2ts from './index';

describe('should export correctly', () => {
  test('export schema2ts', () => {
    expect(schema2ts).toBeDefined();
  });
});
