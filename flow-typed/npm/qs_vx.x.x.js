declare module qs {
  declare function parse(string, ?{ ignoreQueryPrefix?: boolean }): Object
  declare function stringify(
    Object,
    ?{
      arrayFormat?: 'indices' | 'brackets' | 'repeat',
      encodeValuesOnly?: boolean,
      encoder?: string => string,
      skipNulls?: boolean,
    }
  ): string
}
