import { State } from './state'
import { IParseResultSuccess, IParseResultFail, IParserFn, IProjectors, ITraceItem, IParseResult } from './types'
import { Ast } from './grammar-ast'
import * as equal from 'fast-deep-equal/es6'
import { getRuleBodyByName } from './utils'
import { Tracer } from './tracer'
import { Memoize } from 'typescript-memoize'

const idFn = id => id

export interface IMatchResult {
  success: boolean,
  isEof: boolean,
  pos: number,
  result?: any
}

export class Parser implements Ast.IParser {

  protected state: State

  public trace: Tracer = new Tracer()

  public grammar: Ast.GenericGrammar

  protected projectors: IProjectors

  constructor(gr: Ast.GenericGrammar, proj: IProjectors = {}) {
    this.expr = this.expr.bind(this)

    this.grammar = gr
    this.projectors = proj
  }

  protected success(result: any = null, consumed: number = 0): IParseResultSuccess {
    return {
      success: true,
      consumed,
      result
    }
  }

  protected fail(): IParseResultFail {
    return {
      success: false
    }
  }

  private savePos() {
    this.state.savePos()
  }

  private backtrack() {
    this.state.backtrack()
  }

  private accept(result: any) {
    this.state.acceptPos()
    return this.success(result)
  }

  applyProj = (name: string, value: any) => (this.projectors[name] || idFn)(value)

  // ToDo: translate Если ф-ция парсера вызывает другую ф-цию парсера, то успешный результат вложенного парсера нельзя пробрасывать наверх. 
  // Иначе может произойти двойной консум

  @Memoize((...args) => JSON.stringify(args))
  expr (e: Ast.GenericExpr): IParserFn {
    const combinator = this[e[0]]
    if (typeof(combinator) !== 'function') {
      throw new Error(`There is no core combinator with name: '${e[0]}'`)
    }
    const fn: IParserFn = combinator.apply(this, e.slice(1))
    
    return () => {
      this.trace.start(e, this.state.pos)
      const res = fn()
      if (res.success) {
        this.state.consume(res.consumed)
      }
      this.trace.complete(res, this.state.pos)
      return res
    }
  }

  // === Parsers
  
  rule = (name: string): IParserFn => {
    const e = getRuleBodyByName(name, this.grammar)

    return () => this.project(name, e)()
  }

  empty = (): IParserFn => () => {
    return this.success()
  }

  anything = (): IParserFn => () => {
    if (!this.state.isEof) {
      return this.success(this.state.current, 1)
    }
    return this.fail()
  }

  equal = (item: any): IParserFn => () => {
    if (this.state.isString && typeof(item) === 'string') {
      if (this.state.pos + item.length <= this.state.len) {
        const excerpt = this.state.inputAsString.substr(this.state.pos, item.length)
        if (excerpt === item) {
          return this.success(item, excerpt.length)
        }
      }
    } else {
      if (equal(item, this.state.current)) {
        return this.success(item, 1)
      }
    }
    return this.fail()
  }

  seq = (exprs: Ast.GenericExpr[]): IParserFn => { 
    const parsers = exprs.map(this.expr)
    
    return () => {
      const results: any[] = []
      this.savePos()
      for (let i = 0; i < parsers.length; i++) {
        const p = parsers[i];
        const r = p()
        if (!r.success) {
          this.backtrack()
          return this.fail()
        }
        results.push(r.result)
      }
      return this.accept(results)
    }
  }

  alt = (exprs: Ast.GenericExpr[]): IParserFn => { 
    const parsers = exprs.map(this.expr)
    
    return () => {
      for (let i = 0; i < exprs.length; i++) {
        this.savePos();
        const p = parsers[i];
        const r = p()
        if (r.success) {
          return this.accept(r.result)
        }
        this.backtrack()
      }
      return this.fail()
    }
  }

  times = (min: number, max: number, expr: Ast.GenericExpr): IParserFn => { 
    if (max === null || max === undefined)
      max = Infinity
    if (max < 1) {
      throw new Error(`max should be more than zero (or undefined, which interprets as Infinity). max = ${max}`);
    }
    const p = this.expr(expr)

    return () => {
      let count = 0
      const results: any[] = []
      for (; ;) {
        const r = p()
        if (r.success) {
          results.push(r.result)
          count++
          if (count == max) {
            return this.success(results)
          }
        } else {
          if (count >= min) {
            return this.success(results.length === 0 ? undefined : results)
          } else {
            return this.fail()
          }
        }
      }
    }
  }

  token = (token: string): IParserFn => {
    const e: Ast.Expr = ['seq', [
      ['regex', '\\s*'],
      ['equal', token]
    ]]
    const parseFn = this.expr(e)
    
    return () => {
      const r = parseFn()
      if (r.success) {
        return this.success(r.result[1])
      }
      return this.fail()
    }
  }

  not = (expr: Ast.GenericExpr): IParserFn => { 
    const p = this.expr(expr)

    return () => {
      this.savePos()
      const r = p()
      this.backtrack()
      return r.success ? this.fail() : this.success()
    }
  }

  project = (projector: string, expr: Ast.GenericExpr): IParserFn => { 
    const p = this.expr(expr)

    return () => {
      const r = p()
      if (!r.success) {
        return r
      }
      return this.success(this.applyProj(projector, r.result))
    }
  }

  regex = (regex: string): IParserFn => {
    regex = regex.startsWith('^') ? regex : '^' + regex
    const rx = new RegExp(regex)
    if (typeof (this.state.input) !== 'string') {
      throw new Error("regex can be used only if input sequence is string");
    }
    if (!this.state.isString) {
      throw new Error("regex rule can be used only on **string** input stream");
    }

    return () => {
      const s = (this.state.input as unknown as string).substring(this.state.pos)
      const m = rx.exec(s)
      if (m) {
        return this.success(m[0], m[0].length)
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
        return this.success(item, 1)
      }
      return this.fail()
    }
  }

  // === API

  matchExpr = (input: any[], rule: string): IParseResult => {
    this.state = new State(input)
    const p = this.expr(['rule', rule])
    return p()
  }
  
  match = (input: any[], rule: string): IMatchResult => {
    const res = this.matchExpr(input, rule)
    return {
      success: res.success,
      isEof: this.state.isEof,
      pos: this.state.pos,
      result: res.success ? res.result : undefined
    }
  }
}

