import * as fs from "fs";
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




console.dir(p.trace.data, {depth: null})

fs.writeFileSync("./trace.json", JSON.stringify(p.trace.data, null, 2))