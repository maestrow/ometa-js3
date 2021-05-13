import { State } from './state'
import { IParseResultSuccess, IParseResultFail, IParserFn } from './types'
import { GrammarAst as AST } from './grammar-ast'
import * as equal from 'fast-deep-equal/es6'

export class Parser {

  private state: State

  private grammar: AST.Grammar

  constructor(gr: AST.Grammar, input: any[]) {
    this.grammar = gr
    this.state = new State(input)
  }

  private success(consumed: number = 0, result: any = null): IParseResultSuccess {
    return {
      success: true,
      consumed,
      result
    }
  }

  private fail(): IParseResultFail {
    return {
      success: false
    }
  }

  private getRuleBodyByName = (name: string): AST.Expr => 
    this.grammar.find(i => i[0] === name)[1]

  expr = (e: AST.Expr): IParserFn => {
    switch (e[0]) {
      case 'equal':
        return this.equal(e[1])
      case 'rule':
        return this.rule(e[1])
      case 'alt':
        return this.alt(e[1])
      case 'seq':
        return this.seq(e[1])
      case 'notLess':
        return this.notLess(e[1], e[2])
      default:
        throw new Error(`Unknown expression type: ${e[0]}`);
    }
  }

  empty = (): IParserFn => () => {
    return this.success()
  }

  anything = (): IParserFn => () => {
    if (!this.state.isEof) {
      return this.success(1)
    }
    return this.fail()
  }

  equal = (item: any): IParserFn => () => {
    if (equal(item, this.state.current)) {
      this.state.consume(1)
      return this.success(1, item)
    }
    return this.fail()
  }

  rule = (name: string): IParserFn => {
    return this.expr(this.getRuleBodyByName(name))
  }

  seq = (exprs: AST.Expr[]): IParserFn => () => {
    const results: any[] = []
    this.state.savePos()
    for (let i = 0; i < exprs.length; i++) {
      const e = exprs[i];
      const p = this.expr(e)
      const r = p()
      if (!r.success) {
        this.state.backtrack()
        return this.fail()
      }
      results.push(r.result)
    }
    this.state.acceptPos()
    return this.success(0, results)
  }

  alt = (exprs: AST.Expr[]): IParserFn => () => {
    for (let i = 0; i < exprs.length; i++) {
      this.state.savePos();
      const e = exprs[i];
      const p = this.expr(e)
      const r = p()
      if (r.success) {
        this.state.acceptPos()
        return r
      }
      this.state.backtrack()
    }
    return this.fail()
  }

  notLess = (min: number, expr: AST.Expr) => () => {
    let count = 0
    const p = this.expr(expr)
    const results: any[] = []
    for(;;) {
      const r = p()
      if (r.success) {
        results.push(r.result)
        count++
      }
      else {
        if (count >= min) {
          return this.success(0, results)
        } else {
          return this.fail()
        }
      }
    }
  }

  match = (rule: string) => {
    const p = this.rule(rule)
    return p()
  }
}

