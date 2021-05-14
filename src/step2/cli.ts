import { Parser } from './parser'
import { Ast as AST } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1 } from './grammars/ometa1'


const ometaProg = `ometa grammar {}`

//const p = new Parser(math1, [...'((1+2)-3*3)/4'])
//const r = p.match('expr')

const p = new Parser(ometa1, ometaProg as unknown as any[])
const r = p.match('ometa')

console.dir(r, {depth: null})

console.dir(p.trace, {depth: null})