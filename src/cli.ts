import * as fs from "fs";
import { IMatchResult, Parser } from './parser'
import { Ast } from './grammar-ast'
import { math1 } from './grammars/math1'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";
import { IParserFn } from "types";

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
let p: TestParser
let r: IMatchResult
let i: string | any[]
let g: Grammar


// g = [['main', ['token', ['equal', 'aaa']]]]
// p = new TestParser(g)
// i = '   aaaab'
// r = p.match(i as unknown as any[], 'main')
// printRes(p, r)


g = [['main', ['range', 'g', 'n']]]
p = new TestParser(g)
r = p.match('g' as unknown as any[], 'main')
printRes(p, r)
r = p.match('i' as unknown as any[], 'main')
printRes(p, r)
r = p.match('n' as unknown as any[], 'main')
printRes(p, r)
r = p.match('f' as unknown as any[], 'main')
printRes(p, r)
r = p.match('o' as unknown as any[], 'main')
printRes(p, r)
console.log('')
g = [['main', ['range', 'C', 'F']]]
p = new TestParser(g)
r = p.match('C' as unknown as any[], 'main')
printRes(p, r)
r = p.match('E' as unknown as any[], 'main')
printRes(p, r)
r = p.match('F' as unknown as any[], 'main')
printRes(p, r)
r = p.match('B' as unknown as any[], 'main')
printRes(p, r)
r = p.match('G' as unknown as any[], 'main')
printRes(p, r)
console.log('')
g = [['main', ['range', '1', '3']]]
p = new TestParser(g)
r = p.match('1' as unknown as any[], 'main')
printRes(p, r)
r = p.match('2' as unknown as any[], 'main')
printRes(p, r)
r = p.match('3' as unknown as any[], 'main')
printRes(p, r)
r = p.match('0' as unknown as any[], 'main')
printRes(p, r)
r = p.match('4' as unknown as any[], 'main')
printRes(p, r)

//r = p.match('aaaa' as unknown as any[], 'main')
//printRes(p, r)

