import { Parser } from './parser'
import { GrammarAst as AST } from './grammar-ast'
import { math1 } from './grammars/math1'

const p = new Parser(math1, [...'((1+2)-3*3)/4'])

const r = p.match('expr')

console.dir(r, {depth: null})