import * as fs from "fs";
import { Parser } from './parser'
import { Ast as AST } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";


const input = fs.readFileSync('src/grammars/ometa1.ometa', 'utf-8')

//const p = new Parser(math1, [...'((1+2)-3*3)/4'])
//const r = p.match('expr')

const p = new Parser(ometa1, proj)
const r = p.match(input as unknown as any[], 'ometa')


console.dir(r, {depth: null})
const disco = new TraceDiscovery(ometa1, input, p.trace.data)
const trace = disco.convert()

//console.dir(trace, {depth: null})
fs.writeFileSync("./dist/trace.json", JSON.stringify(trace, null, 2))
