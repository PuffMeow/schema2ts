interface IOptions {
  /** When parse schema error, this message will be return */
  parseErrorMessage?: string;
  /** Display comments at the top of the code */
  explain?: string;
  /** Whether to automatically generate comments */
  isGenComment?: boolean;
  indent?: number;
  semi?: boolean;
  /** If this is enabled, it will generate the optional interface */
  optional?: boolean;
}

export interface IJsonSchema {
  title?: string;
  type?: string;
  properties?: { [key: string]: IJsonSchema };
  items?: IJsonSchema;
  enum?: IEnumType[];
  description?: string;
}

export interface IEnumType {
  title?: string;
  value?: string;
}
