import * as fs from "fs";
import { Parser } from './parser'
import { Ast as AST } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";

const saveTrace = (p: Parser) => {
  const disco = new TraceDiscovery(ometa1, input, p.trace.data)
  const trace = disco.convert()
  fs.writeFileSync("./dist/trace.json", JSON.stringify(trace, null, 2))  
}

const input = fs.readFileSync('src/grammars/ometa1.ometa', 'utf-8')

const p = new Parser(ometa1, input as unknown as any[], proj)

const r = p.match('ometa')


console.dir(r, {depth: null})


