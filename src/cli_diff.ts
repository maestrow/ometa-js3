import * as fs from "fs";
import { IMatchResult, Parser } from './parser'
import { Ast } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";
import { IParserFn } from "types";
import * as equal from "fast-deep-equal/es6";

const printTrace = (p: Parser, input) => {
  const disco = new TraceDiscovery(p.grammar, input, p.trace.data)
  const trace = disco.convert()
  console.log(JSON.stringify(trace, null, 2))
}

const saveTrace = (p: Parser, input) => {
  const disco = new TraceDiscovery(p.grammar, input, p.trace.data)
  const trace = disco.convert()
  fs.writeFileSync("./dist/trace.json", JSON.stringify(trace, null, 2))  
}

const printRes = (p: Parser, res: IMatchResult) => {
  console.dir(r, {depth: null})
  // const trace = p.trace.data[p.trace.data.length-1]
  // console.log('root trace item:')
  // console.dir(trace, {depth:1})
}

const input = fs.readFileSync('src/grammars/ometa1.ometa', 'utf-8')
const p = new Parser(ometa1, proj)
const r = p.match(input as unknown as any[], 'ometa')

saveTrace(p, input)
printRes(p, r)
const isEqual = equal(ometa1, r.result)

console.log('\nDiff:\n')
console.log('isEqual: ' + isEqual)

fs.writeFileSync("./dist/diff_expected.json", JSON.stringify(ometa1, null, 2))
fs.writeFileSync("./dist/diff_actual.json", JSON.stringify(r.result, null, 2))




