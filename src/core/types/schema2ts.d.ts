interface IOptions {
  /** Display comments at the top of the code */
  explain?: string;
  /** Whether to automatically generate comments */
  isGenComment?: boolean;
  indent?: number;
  semi?: boolean;
}

export interface IEnumType {
  title?: string;
  value?: string;
}

export interface IJsonSchema {
  title?: string;
  type?: string;
  properties?: { [key: string]: IJsonSchema };
  items?: IJsonSchema;
  enum?: IEnumType[];
}
