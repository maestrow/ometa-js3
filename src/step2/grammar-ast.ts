import { IParserFn } from "./types";

// https://github.com/microsoft/TypeScript/pull/39094 Variadic tuple types
type DropFirst<T extends readonly unknown[]> = T extends readonly [any?, ...infer U] ? U : [...T];

export namespace Ast {
  export type Grammar = Rule[]
  export type Rule = [string, Expr]
  
  export type Expr = 
      Ex.Seq 
    | Ex.Alt 
    | Ex.Atom 
    | Ex.Rule 
    | Ex.Times
    | Ex.Token
    | Ex.Not
    | Ex.Project
    | Ex.Regex
    | Ex.Range

  export type IParser = { [T in Expr as T[0]]: (...args: DropFirst<T>) => IParserFn }

  export namespace Ex {
    export type Seq = ['seq', Expr[]]
    export type Alt = ['alt', Expr[]]
    export type Atom = ['equal', string]
    export type Rule = ['rule', string]
    export type Times = ['times', number, number, Expr]
    
    export type Token = ['token', string]
    export type Not = ['not', Expr]
    export type Project = ['project', string, Expr]
    export type Regex = ['regex', string]
    export type Range = ['range', string, string]
  }  
}