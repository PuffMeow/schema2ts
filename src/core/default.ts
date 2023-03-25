import { IOptions } from './types/schema2ts';

export const defaultOptions: IOptions = {
  parseErrorMessage: '// Parse schema error, please check your schema.',
  optional: true,
  explain: '',
  isGenComment: false,
  indent: 2,
  semi: true,
  ignoreKeys: [],
  preffix: 'I',
  preffixOfEnum: 'T',
};
