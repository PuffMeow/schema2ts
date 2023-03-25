import { describe, expect, test } from 'vitest';
import {
  getEnumType,
  capitalize,
  getIndent,
  generateComment,
  removeComment,
  checkIsValidTitle,
} from './index';

describe('utils test', () => {
  test('should uppercase the first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  test('empty enums', () => {
    expect(getEnumType([])).toBe('');
  });

  test('should filter enum when miss the value', () => {
    expect(
      getEnumType([
        {
          title: 'test enum1',
        },
        {
          title: 'test enum2',
        },
        {
          title: 'test enum3',
        },
      ]),
    ).toBe('');

    expect(
      getEnumType([
        {
          title: 'test enum1',
        },
        {
          title: 'test enum2',
        },
        {
          title: 'test enum3',
          value: 'enum3',
        },
      ]),
    ).toBe("'enum3'");

    expect(
      getEnumType([
        {
          title: 'test enum1',
          value: 'enum1',
        },
        {
          title: 'test enum2',
        },
        {
          title: 'test enum3',
          value: 'enum3',
        },
      ]),
    ).toBe("'enum1' | 'enum3'");
  });

  test('should get a right enum type', () => {
    expect(
      getEnumType([
        {
          title: 'test enum1',
          value: 'enum1',
        },
        {
          title: 'test enum2',
          value: 'enum2',
        },
        {
          title: 'test enum3',
          value: 'enum3',
        },
      ]),
    ).toBe("'enum1' | 'enum2' | 'enum3'");
  });

  test('should get a right indent', () => {
    expect(getIndent(2)).toBe('  ');
  });

  test('should generate comment correctly', () => {
    expect(
      generateComment({
        type: 'array',
        title: 'test arr3',
        items: {
          type: 'object',
          title: 'test arr3 items',
          description: 'test arr3 description',
        },
      }),
    ).toBe(`  /** test arr3 test arr3 items (test arr3 description) */\n`);

    expect(
      generateComment({
        type: 'string',
        title: 'test string title',
        description: 'test string description',
      }),
    ).toBe(`  /** test string title (test string description) */\n`);

    expect(generateComment({})).toBe('');
  });

  test('should remove comment', () => {
    expect(removeComment(`  /** test arr3 test arr3 items */\n`)).toBe('');
  });

  test('checkIsValidTitle', () => {
    expect(checkIsValidTitle()).toBe(false);
    expect(checkIsValidTitle('Test')).toBe(true);
    expect(checkIsValidTitle('冲冲冲')).toBe(false);
  });
});
