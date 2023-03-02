import { IOptions } from './types/schema2ts';

export const defaultOptions: IOptions = {
  parseErrorMessage: '// Parse schema error, please check your schema.',
  explain: '',
  isGenComment: true,
  indent: 2,
  semi: true,
};
