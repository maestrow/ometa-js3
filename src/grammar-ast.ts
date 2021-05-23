import { IParserFn } from "./types";

// https://github.com/microsoft/TypeScript/pull/39094 Variadic tuple types
type First<T extends readonly unknown[]> = T[0];
type DropFirst<T extends readonly unknown[]> = T extends readonly [any?, ...infer U] ? U : [...T];

export namespace Ast {
  export type GenericGrammar = Array<[string, GenericExpr]>
  export type GenericExpr = [string, ...(GenericExpr[]|GenericExpr|string|number)[]]
  export type Grammar<E extends GenericExpr = never> = Rule<Expr<E>>[]
  export type Rule<E extends GenericExpr = never> = [string, Expr<E>]
  export type Expr<E extends GenericExpr = never> = 
      Ex.Seq<E>
    | Ex.Alt<E>
    | Ex.Equal 
    | Ex.Rule 
    | Ex.Times<E>
    | Ex.Token
    | Ex.Not<E>
    | Ex.Project<E>
    | Ex.Regex
    | Ex.Range
    | Ex.Anything
    | Ex.Lr<E>
    | E

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
    export type Seq<E extends GenericExpr> = ['seq', Expr<E>[]]
    export type Alt<E extends GenericExpr> = ['alt', Expr<E>[]]
    export type Equal = ['equal', string]
    export type Rule = ['rule', string]
    export type Times<E extends GenericExpr> = ['times', number, number, Expr<E>]
    export type Token = ['token', string]
    export type Not<E extends GenericExpr> = ['not', Expr<E>]
    export type Project<E extends GenericExpr> = ['project', string, Expr<E>]
    export type Regex = ['regex', string]
    export type Range = ['range', string, string]
    export type Anything = ['anything']
    export type Lr<E extends GenericExpr> = ['lr', Expr<E>]
  }  
}