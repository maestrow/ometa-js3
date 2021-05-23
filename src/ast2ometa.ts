import { Ast } from "./grammar-ast";

export const ast2ometa = (ast: Ast.Grammar) => {

}

export class Templates implements Ast.ITemplator {
  _mm = (num: number) => typeof(num) !== 'number' ? '' : num

  State = {
    level: 0
  }

  Grammar = (name: string, rules: string[]) => {
    const r = rules.join(',\n')
    return `ometa ${name} {\n${r}\n}\n`
  }

  Rule = (name: string, body: string) => `  ${name} = ${body}`

  seq = (exprs: string[]) => {
    return exprs.length <= 1 || this.State.level === 0
      ? exprs.join(" ")
      : '(' + exprs.join(" ") + ')' 
  }
  alt = (exprs: string[]) => {
    const tpl = "\n    | "
    return exprs.length <= 1 
      ? exprs.join()
      : this.State.level === 0
      ? tpl + exprs.join(tpl)
      : '(' + tpl + exprs.join(tpl) + '\n  )'
  }
  equal = (value: string) => `'${value}'`
  rule = (name: string) => name
  times = (min: number, max: number, expr: string) => {
    if (min === 0 && max === 1) {
      return `${expr}?`
    } 
    if (min === 0 && typeof(max) !== 'number') {
      return `${expr}*`
    } 
    if (min === 1 && typeof(max) !== 'number') {
      return `${expr}+`
    }
    const sMin = this._mm(min)
    const sMax = this._mm(max)
    
    return `${expr}{${sMin},${sMax}}`
  }
  token = (value: string) => `"${value}"`
  not = (expr: string) => `~${expr}`
  project = (name: string, expr: string) => `${expr} -> ${name}`
  regex = (value: string) => `/${value}/`
  range = (from: string, to: string) => `${from}-${to}`
  anything = () => 'anything'
  lr = (expr) => expr
}

export class TemplatesTrace extends Templates {
  alt = (exprs: string[]) => {
    const tpl = " | "
    return exprs.length <= 1 
      ? exprs.join()
      : this.State.level === 0
      ? exprs.join(tpl)
      : '(' + exprs.join(tpl) + ')'
  }
}


// ToDo: Почему Compiler - это отдельная сущность, а не IProjectors?!
// После реализации сопоставления на массивы, следует переписать компилятор на грамматику с IProjectors.

export class Compiler {
  templates: Ast.ITemplator

  constructor(tpl: Ast.ITemplator) {
    this.templates = tpl
  }

  /**
  * A note on the interpretation of arguments as expressions. 
  * At the moment, the condition is used: 
  * 1) if arg is array and the first element is a string, then this is an expression. 
  * 2) if arg is array and the first element is not a string, then this is an array of expressions.
  * Later, when grammar expressions will accept arrays (which are not expressions) as arguments, 
  * then the algorithm will need to be rewritten.
  * ToDo: will it actually can happens?
  */
  compileExpr = (e: Ast.GenericExpr, level: number = 0): string => {
    const args = e.slice(1).map(i =>
      i instanceof Array
        ? typeof(i[0]) === 'string'
          ? this.compileExpr(i as Ast.GenericExpr, level+1)
          : i.map(j => this.compileExpr(j, level+1))
        : i
    )
    this.templates.State.level = level
    return this.templates[e[0]].apply(this, args)
  }

  compile = (g: Ast.Grammar, gramName: string): string => {
    const rules = g.map(rule => this.templates.Rule(rule[0], this.compileExpr(rule[1])))
    return this.templates.Grammar(gramName, rules)
  }
}
