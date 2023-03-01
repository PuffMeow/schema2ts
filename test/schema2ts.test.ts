import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import schema2ts from '../src';

describe('Is the output correct', () => {
  test('schema2ts', () => {
    const input = fs.readFileSync(
      path.join(__dirname, './schema1.json'),
      'utf-8',
    );
    const shouldOutput = fs.readFileSync(
      path.join(__dirname, './output1.ts'),
      'utf-8',
    );

    const output = schema2ts(input);

    expect(output).toBe(shouldOutput);
  });
});
