import { Ast } from "grammar-ast"
import { IMatchResult, Parser } from "./parser"
import * as equal from 'fast-deep-equal'
import { IParserFn } from "types"

class TestParser extends Parser {
  
  value = (v: any): IParserFn => () => {
    return this.success(v)
  }

  consume_but_fail = (n: number) => () => {
    this.state.consume(n)
    return this.fail()
  }
}

type Expr = 
  | ['value', any]
  | ['consume_but_fail', number]
type Grammar = Ast.Grammar<Expr>

const g: Grammar = [['main', ['alt', [
  ['consume_but_fail', 1],
  ['value', 'c'],
]]]]

declare global {
  namespace jest {
    interface Matchers<R> {
      shouldSucceedAtEof(p: Parser, expectedValue: any): CustomMatcherResult
    }
  }
}

expect.extend({
  shouldSucceedAtEof(actual: IMatchResult, p: Parser, expectedValue: any) {
    if(actual.success) {
      const exp = JSON.stringify(expectedValue)
      const act = JSON.stringify(actual.result)
      if (!actual.isEof) {
        return {
          message: () => `Match succeeded, but not at eof. pos=${actual.pos}. Trace data:\n\n${p.trace.data}`,
          pass: false
        }
      }
      if (equal(actual.result, expectedValue)) {
        return {
          message: () => `ok`,
          pass: true
        }
      }
      return {
        message: () => `Match succeeded at eof. But expected result is ${exp}, actual: '${act}'`,
        pass: false
      }
    }
    return {
      message: () => `Match is not succeeded. Trace data:\n\n${p.trace.data}`,
      pass: false
    }
  }
})

test('equal', () => {
  const g: Grammar = [['main', ['equal', 'a']]]
  const p = new TestParser(g)
  const r = p.match('a' as unknown as any[], 'main')
  expect(r).shouldSucceedAtEof(p, 'a')
})

test('seq', () => {
  const g: Grammar = [
    ['main', ['seq', [
      ['value', 2],
      ['value', 'b'],
      ['value', ['a', 2]],
    ]]]
  ]
  const p = new TestParser(g)
  const r = p.match('' as unknown as any[], 'main')
  expect(r).shouldSucceedAtEof(p, [ 2, 'b', [ 'a', 2 ] ])
})