import * as fs from "fs";
import { Parser } from './parser'
import { Ast } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";
import { IParserFn } from "types";

const saveTrace = (p: Parser, input) => {
  const disco = new TraceDiscovery(ometa1, input, p.trace.data)
  const trace = disco.convert()
  fs.writeFileSync("./dist/trace.json", JSON.stringify(trace, null, 2))  
}

// const input = fs.readFileSync('src/grammars/ometa1.ometa', 'utf-8')
// const p = new Parser(ometa1, proj)
// const r = p.match(input as unknown as any[], 'ometa')

class TestParser extends Parser {
  value = (v: any): IParserFn => () => {
    return this.success(v)
  }

  consume_but_fail = (n: number) => () => {
    this.state.consume(n)
    return this.fail()
  }
}

type Expr = 
  | ['value', any]
  | ['consume_but_fail', number]
type Grammar = Ast.Grammar<Expr>

const g: Grammar = [['main', ['alt', [
  ['consume_but_fail', 1],
  ['value', 'c'],
]]]]

const p = new TestParser(g)
const r = p.match('' as unknown as any[], 'main')

console.dir(r, {depth: null})
const trace = p.trace.data.pop()
delete trace.children
console.log('root trace item:')
console.dir(trace, {depth:null})


