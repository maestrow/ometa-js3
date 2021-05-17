import { Ast } from "../grammar-ast";
import { TraceItem } from "../tracer";
import { Compiler, Templates, TemplatesTrace } from "../ast2ometa";

export class TraceDiscovery {

  grammar: Ast.Grammar
  input: string
  trace: TraceItem[]

  compiler: Compiler

  constructor (gr: Ast.Grammar, input: string, trace: TraceItem[]) {
    this.grammar = gr
    this.input = input
    this.trace = trace

    this.compiler = new Compiler(new TemplatesTrace())
  }

  convertItem = (item: TraceItem): any => {
    
    const strExpr = item.expr[0] + ' >> ' + this.compiler.compileExpr(item.expr) // ToDo: memoize
    const to = item.result.success ? item.endPos : item.startPos + 35
    const snippet = this.input.substring(item.startPos, to)
    const pos = item.result.success 
      ? `consumed [${item.startPos}~${item.result.consumed}->${item.endPos}]` 
      : `failed at ${item.startPos}`

    let r: any = item.result.success
      ? {
        expr: strExpr,
        [pos]: snippet,
        result: item.result.result,
      } : {
        expr: strExpr,
        [pos]: snippet,
      }

    if (item.children.length > 0) {
      r.children = item.children.map(this.convertItem)
    }
    
    return r
  }

  convert = (): any[] => {
    return this.trace.map(this.convertItem)
  }
}