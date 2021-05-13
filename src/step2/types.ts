
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

