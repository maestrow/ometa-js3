
export type IParseResultSuccess = {
  success: true,
  consumed: number,
  result: any
}

export type IParseResultFail = {
  success: false
}

export type IParseResult = IParseResultSuccess | IParseResultFail

export type IParserFn = () => IParseResult

export type IProjectors = {
  [key: string]: (args: [...any]) => any
}

export interface ITraceItem {
  rule: string,
  pos: number,
  success: boolean
}