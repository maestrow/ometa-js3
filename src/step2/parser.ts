import { State } from './state'
import { IParseResultSuccess, IParseResultFail, IParserFn, IProjectors, ITraceItem } from './types'
import { Ast } from './grammar-ast'
import * as equal from 'fast-deep-equal/es6'
import { AsyncParallelBailHook } from 'tapable'
import { getRuleBodyByName } from './utils'

export class Parser implements Ast.IParser {

  private state: State

  private grammar: Ast.Grammar

  private projectors: IProjectors

  constructor(gr: Ast.Grammar, input: any[], proj: IProjectors = {}) {
    this.grammar = gr
    this.state = new State(input)
    this.projectors = proj
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

  trace: ITraceItem[] = []

  expr = (e: Ast.Expr): IParserFn => {
    return this[e[0]].apply(this, e.slice(1))
  }

  // === Parsers
  
  rule = (name: string): IParserFn => {
    return this.project(name, getRuleBodyByName(name, this.grammar))
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

  seq = (exprs: Ast.Expr[]): IParserFn => () => {
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

  alt = (exprs: Ast.Expr[]): IParserFn => () => {
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

  times = (min: number, max: number, expr: Ast.Expr): IParserFn => () => {
    if (max === null || max === undefined)
      max = Infinity
    if (max < 1) {
      throw new Error(`max should be more than zero (or undefined, which interprets as Infinity). max = ${max}`);
    }
    let count = 0
    const p = this.expr(expr)
    const results: any[] = []
    for (; ;) {
      const r = p()
      if (r.success) {
        results.push(r.result)
        count++
        if (count == max) {
          return this.success(0, results)
        }
      } else {
        if (count >= min) {
          return this.success(0, results)
        } else {
          return this.fail()
        }
      }
    }
  }

  token = (token: string): IParserFn => {
    const e: Ast.Expr = ['seq', [
      ['times', 0, null, ['alt', [
        ['equal', ' '],
        ['equal', '\t']
      ]]],
      ['equal', token]
    ]]
    return this.expr(e)
  }

  not = (expr: Ast.Expr): IParserFn => () => {
    this.state.savePos()
    const p = this.expr(expr)
    const r = p()
    this.state.backtrack()
    return r.success ? this.fail() : this.success(0)
  }

  project = (projector: string, expr: Ast.Expr): IParserFn => () => {
    const p = this.expr(expr)
    const r = p()
    if (!r.success) {
      return r
    }

    const proj = this.projectors[projector]
    if (proj) {
      const res = proj(r.result)
      return this.success(r.consumed, res)
    } else {
      return r
    }
  }

  regex = (regex: string): IParserFn => {
    const rx = new RegExp(regex).compile()
    if (typeof (this.state.input) !== 'string') {
      throw new Error("regex can be used only if input sequence is string");
    }
    return () => {
      const s = (this.state.input as unknown as string).substring(this.state.pos)
      const m = rx.exec(s)
      if (m) {
        return this.success(m[0].length, m[0])
      }
      return this.fail()
    }
  }

  range = (from: string, to: string): IParserFn => {
    if (from.length != 1 || to.length != 1) {
      throw new Error(`from and to must be 1 symbol length: from=${from}, to=${to}`);
    }
    return () => {
      let item: any = this.state.current
      if (item >= from && item <= to) {
        return this.success(1, item)
      }
      return this.fail()
    }
  }

  // === API

  match = (rule: string) => {
    const p = this.expr(['rule', rule])
    return p()
  }
}

