import { Ast } from "grammar-ast"
import { IMatchResult, Parser } from "./parser"
import { IParseResult, IParserFn } from "types"
import * as equal from "fast-deep-equal";
import { State } from "./state";

/* Private members accessed as:

const p: Parser = new Parser(...)
const s = p['state'] // private member access
*/

const testRes = (title: string, msg: string, pass: boolean): jest.CustomMatcherResult => {
  return {
    message: () => title ? `${title}: ${msg}` : msg,
    pass
  }
}

const pass = (title: string, msg: string = "ok") => testRes(title, msg, true)

const fail = (title: string, msg: string = "failed") => testRes(title, msg, false)

const aggregate = (title: string, results: jest.CustomMatcherResult[], p: Parser): jest.CustomMatcherResult => {
  if (results.some(i => !i.pass)) {
    const msg = results.map(i => '  ' + i.message()).join('\n')
    const t = JSON.stringify(p.trace.data)
    return fail(null, `${title}:\n${msg}\n  Trace: ${t}`)
  }
  return pass(title)
}

declare global {
  namespace jest {
    interface Matchers<R> {
      success(): CustomMatcherResult
      failed(): CustomMatcherResult
      positionAt(expectedPos: number): CustomMatcherResult
      positionAtAtEof(): CustomMatcherResult
      resultIs(expectedValue: any): CustomMatcherResult
      succeedAt(p: Parser, expectedValue: any, expectedPos: number): CustomMatcherResult
      succeedAtEof(p: Parser, expectedValue: any): CustomMatcherResult
    }
  }
}

const jestExtentions = {
  success(actual: IParseResult) {
    const t = 'success'
    return actual.success ? pass(t) : fail(t)
  },

  failed(actual: IParseResult) {
    const t = 'failed'
    return !actual.success ? pass(t) : fail(t)
  },

  positionAt(p: Parser, expectedPos: number) {
    const t = 'positionAt'
    if (p['state'].pos !== expectedPos)
      return fail(t, `Expected pos: ${expectedPos}, actual: ${p['state'].pos}.`)
    return pass(t)
  },

  positionAtAtEof(p: Parser) {
    const t = 'positionAtAtEof'
    if (!p['state'].isEof)
      return fail(t, `Position is not at eof. pos=${p['state'].pos}.`)
    return pass(t)
  },

  resultIs(actual: IParseResult, expectedValue: any) {
    const t = 'resultIs'
    if (actual.success) {
      if (!equal(actual.result, expectedValue)) {
        const exp = JSON.stringify(expectedValue)
        const act = JSON.stringify(actual.result)
        return fail(t, `Expected result: ${exp}\nactual: '${act}'`)
      }
      return pass(t)  
    }
    return fail('Not even success')
  },

  succeedAt(res: IParseResult, p: Parser, expectedValue: any, expectedPos: number) {
    return aggregate('succeedAt', [
      jestExtentions.success(res),
      jestExtentions.positionAt(p, expectedPos),
      jestExtentions.resultIs(res, expectedValue)
    ], p)
  },

  succeedAtEof(res: IParseResult, p: Parser, expectedValue: any, expectedPos: number) {
    return aggregate('succeedAtEof', [
      jestExtentions.success(res),
      jestExtentions.positionAtAtEof(p),
      jestExtentions.resultIs(res, expectedValue)
    ], p)
  }
}

expect.extend(jestExtentions)

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

describe('equal', () => {
  test('one char succeeded', () => {
    const g: Grammar = [['main', ['equal', 'a']]]
    const p = new TestParser(g)
    const r = p.matchExpr('a' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'a')
  })

  test('few chars succeeded', () => {
    const g: Grammar = [['main', ['equal', 'abc']]]
    const p = new TestParser(g)
    const r = p.matchExpr('abcZ' as unknown as any[], 'main')
    expect(r).succeedAt(p, 'abc', 3)
  })
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
  const r = p.matchExpr('' as unknown as any[], 'main')
  expect(r).succeedAtEof(p, [ 2, 'b', [ 'a', 2 ] ])
})

test('alt must backtrack when case is failed', () => {
  const g: Grammar = [['main', ['alt', [
    ['consume_but_fail', 1],
    ['value', 'c'],
  ]]]]
  
  const p = new TestParser(g)
  const r = p.matchExpr([1], 'main')
  expect(r).succeedAt(p, 'c', 0)
})

test('times', () => {
  const g: Grammar = [['main', ['times', 1, null, ['equal', 'a']]]]
  const p = new TestParser(g)
  const r = p.matchExpr('aaa' as unknown as any[], 'main')
  expect(r).succeedAtEof(p, [ 'a', 'a', 'a' ])
})

test('token', () => {
  const g: Grammar = [['main', ['token', 'aaaa']]]
  const p = new TestParser(g)
  const r = p.matchExpr('   aaaab' as unknown as any[], 'main')
  expect(r).succeedAt(p, 'aaaa', 7)
})

describe('not', () => {
  test('success', () => {
    const g: Grammar = [['main', ['not', ['equal', 'abc']]]]
    const p = new TestParser(g)
    const r = p.matchExpr('abcZ' as unknown as any[], 'main')
    expect(r).failed()
  })

  test('failed', () => {
    const g: Grammar = [['main', ['not', ['equal', 'abc']]]]
    const p = new TestParser(g)
    const r = p.matchExpr('Zabc' as unknown as any[], 'main')
    expect(r).succeedAt(p, null, 0)
  })
})

describe('regex', () => {

  describe('at begin of line', () => {
    test('failed', () => {
      const g: Grammar = [['main', ['regex', '\\d+']]]
      const p = new TestParser(g)
      const r = p.matchExpr('123abc' as unknown as any[], 'main')
      expect(r).succeedAt(p, '123', 3)
    })
    test('failed', () => {
      const g: Grammar = [['main', ['regex', '\\d+']]]
      const p = new TestParser(g)
      const r = p.matchExpr('abc123' as unknown as any[], 'main')
      expect(r).failed()
    })
  })

  describe('not first expression', () => {
    test('failed', () => {
      const g: Grammar = [['main', ['seq', [['equal', 'xyz'], ['regex', '\\d+']]]]]
      const p = new TestParser(g)
      const r = p.matchExpr('xyz123abc' as unknown as any[], 'main')
      expect(r).succeedAt(p, [ 'xyz', '123' ], 6)
    })
    test('failed', () => {
      const g: Grammar = [['main', ['seq', [['equal', 'xyz'], ['regex', '\\d+']]]]]
      const p = new TestParser(g)
      const r = p.matchExpr('xyzabc123' as unknown as any[], 'main')
      expect(r).failed()
    })
  })
})

describe('range', () => {

  test('g-n', () => {
    let r: IParseResult
    const g: Grammar = [['main', ['range', 'g', 'n']]]
    const p = new TestParser(g)
    r = p.matchExpr('g' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'g')
    r = p.matchExpr('i' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'i')
    r = p.matchExpr('n' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'n')
    r = p.matchExpr('f' as unknown as any[], 'main')
    expect(r).failed()
    r = p.matchExpr('o' as unknown as any[], 'main')
    expect(r).failed()
  })

  test('C-F', () => {
    let r: IParseResult
    const g: Grammar = [['main', ['range', 'C', 'F']]]
    const p = new TestParser(g)
    r = p.matchExpr('C' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'C')
    r = p.matchExpr('E' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'E')
    r = p.matchExpr('F' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, 'F')
    r = p.matchExpr('B' as unknown as any[], 'main')
    expect(r).failed()
    r = p.matchExpr('G' as unknown as any[], 'main')
    expect(r).failed()
  })

  test('1-3', () => {
    let r: IParseResult
    const g: Grammar = [['main', ['range', '1', '3']]]
    const p = new TestParser(g)
    r = p.matchExpr('1' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, '1')
    r = p.matchExpr('2' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, '2')
    r = p.matchExpr('3' as unknown as any[], 'main')
    expect(r).succeedAtEof(p, '3')
    r = p.matchExpr('0' as unknown as any[], 'main')
    expect(r).failed()
    r = p.matchExpr('4' as unknown as any[], 'main')
    expect(r).failed()
  })
})