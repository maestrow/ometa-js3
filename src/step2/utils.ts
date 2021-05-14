import { Ast } from "./grammar-ast";

export const getRuleBodyByName = (name: string, grammar: Ast.Grammar): Ast.Expr =>
  grammar.find(i => i[0] === name)[1]