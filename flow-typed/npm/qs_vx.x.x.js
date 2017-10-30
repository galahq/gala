type qs$Query = {[string]: string | string[]}
declare module qs {
  declare function parse(string, {ignoreQueryPrefix: boolean,}): qs$Query
  declare function stringify(qs$Query): string
}
