import * as fs from "fs";
import * as path from "path";
import { Parser } from './parser'
import { Ast as AST } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";
import { exit } from "process";


console.log(fs.readdirSync('./'))

const input = fs.readFileSync('src/step2/grammars/ometa1.ometa', 'utf-8')

//const p = new Parser(math1, [...'((1+2)-3*3)/4'])
//const r = p.match('expr')

const p = new Parser(ometa1, input as unknown as any[], proj)
const r = p.match('ometa')


console.dir(r, {depth: null})
const disco = new TraceDiscovery(ometa1, input, p.trace.data)
const trace = disco.convert()

//console.dir(trace, {depth: null})
fs.writeFileSync("./trace.json", JSON.stringify(trace, null, 2))
