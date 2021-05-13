export namespace GrammarAst {
  export type Grammar = Rule[]
  export type Rule = [string, Expr]
  export type Expr = ExSeq | ExAlt | ExAtom | ExRule | ExNotLess
  export type ExSeq = ['seq', Expr[]]
  export type ExAlt = ['alt', Expr[]]

  export type ExAtom = ['equal', string]
  export type ExRule = ['rule', string]
  export type ExNotLess = ['notLess', number, Expr]
}