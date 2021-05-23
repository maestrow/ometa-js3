import * as fs from "fs";
import { IMatchResult, Parser } from './parser'
import { TraceDiscovery } from "./utils/trace-discover";
import { IParserFn } from "types";
import * as equal from "fast-deep-equal/es6";
import { Ast } from "grammar-ast";

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

const g1: Ast.Grammar = [
  ['expr', ['lr', ['alt', [
    ['seq', [
      ['rule', 'expr'],
      ['equal', '+'],
      ['rule', 'num'],
    ]],
    ['rule', 'num']
  ]]]],
  ['num', ['range', '0', '9']]
]

const g2: Ast.Grammar = [
  ['x', ['lr', ['rule', 'expr']]],
  ['expr', ['alt', [
    ['seq', [
      ['rule', 'x'],
      ['equal', '+'],
      ['rule', 'num'],
    ]],
    ['rule', 'num']
  ]]],
  ['num', ['range', '0', '9']]
]

const input = "1+2+3"
const p = new Parser(g2)
const r = p.match(input as unknown as any[], 'x')

// saveTrace(p, input)
printRes(p, r)


