export interface IOptions {
  /** When parse schema error, this message will be return */
  parseErrorMessage?: string;
  /** Display comments at the top of the code */
  explain?: string;
  /** Whether to automatically generate comments */
  isGenComment?: boolean;
  /** Default value is 2 */
  indent?: number;
  /** Enable semicolon, default is true */
  semi?: boolean;
  /** If this is enabled, it will generate the optional interface, default value is true */
  optional?: boolean;
  /** If you don't want to generate the type of an attribute in a root object, 
   * you can pass in the key name of the corresponding attribute.
   * 
   * Like this, ignoreKeys: ["firstName", "lastName"]
   * 
   * Schema2ts will ignore the two attributes and doesn't generate the type of them.
   * */
  ignoreKeys?: string[];
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
