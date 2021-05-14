import { IParserFn } from "./types";

// https://github.com/microsoft/TypeScript/pull/39094 Variadic tuple types
type First<T extends readonly unknown[]> = T[0];
type DropFirst<T extends readonly unknown[]> = T extends readonly [any?, ...infer U] ? U : [...T];

export namespace Ast {
  export type Grammar = Rule[]
  export type Rule = [string, Expr]
  export type GenericExpr = [string, ...(GenericExpr[]|GenericExpr|string|number)[]]
  export type Expr = 
      Ex.Seq 
    | Ex.Alt 
    | Ex.Equal 
    | Ex.Rule 
    | Ex.Times
    | Ex.Token
    | Ex.Not
    | Ex.Project
    | Ex.Regex
    | Ex.Range

  type ExprToStr<T> = T extends Expr[]
    ? string[]
    : T extends Expr
    ? string 
    : T

  type TemplatorArgs<T extends unknown[]> = { [K in keyof T]: ExprToStr<T[K]> };

  /*
  Correct ITemplator inference implementation is supposed to be:
      type DropFirst<T extends readonly unknown[]> = T extends readonly [any?, ...infer U] ? U : [...T];
      type TemplatorArgs<T extends unknown[]> = { [K in keyof T]: ExprToStr<T[K]> };
      export type ITemplator = { [T in Expr as T[0]]: (...x: TemplatorArgs<DropFirst<T>>) => string }

    But last expression causes: A rest parameter must be of an array type. ts(2370)

    Issue: https://github.com/microsoft/TypeScript/issues/29919 When trying to use mapped tuples as rest parameters error 'A rest parameter must be of an array type' given

    So we use this not so well workaround, that duplicates DropFirst functionality:
  */
  type ToTemplator<T extends readonly unknown[]> = T extends readonly [any?, ...infer U] ? TemplatorArgs<U> : [...T];

  export type IParser = { [T in Expr as T[0]]: (...args: DropFirst<T>) => IParserFn }
  export type ICompiler = { [T in Expr as T[0]]: (...args: DropFirst<T>) => string }
  export type ITemplator = { [T in Expr as T[0]]: (...x: ToTemplator<T>) => string } & {
    Grammar: (gramName: string, rules: string[]) => string,
    Rule: (name: string, body: string) => string,
    State: {
      level: number
    }
  }

  export namespace Ex {
    export type Seq = ['seq', Expr[]]
    export type Alt = ['alt', Expr[]]
    export type Equal = ['equal', string]
    export type Rule = ['rule', string]
    export type Times = ['times', number, number, Expr]
    export type Token = ['token', string]
    export type Not = ['not', Expr]
    export type Project = ['project', string, Expr]
    export type Regex = ['regex', string]
    export type Range = ['range', string, string]
  }  
}