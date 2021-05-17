/*

pos(....): qwws
  pos(....): qwdqwd
    pos(....): qwdqwd -> pos
    pos(....): vdvd -> pos
    pos(....): rtrr <- fail
    <- fail
  <-fail
<- fail

*/

import { Ast } from "./grammar-ast";
import { IParseResult } from "./types";

export interface TraceItem {
  expr: any,
  // Position before expression apply
  startPos: number,
  endPos: number,
  result: IParseResult
  children: TraceItem[]
}

export class Tracer {
  data: TraceItem[] = []

  private stack: TraceItem[][] = [this.data]

  private head: TraceItem[] = this.data
  
  private started: TraceItem = undefined

  private get isStarted() {
    return this.started !== undefined
  }

  start = (expr: Ast.Expr, startPos: number) => {
    if (this.isStarted) {
      this.stack.push(this.started.children)
      this.head = this.started.children
    }

    const newItem = {
      expr,
      startPos,
      endPos: undefined,
      result: undefined,
      children: []
    }
    this.started = newItem
    this.head.push(newItem)
  }

  complete = (result: IParseResult, endPos: number) => {
    if (!this.isStarted) {
      this.stack.pop()
      this.head = this.stack[this.stack.length-1]
      this.started = this.head[this.head.length-1]
    }
    this.started.result = result
    this.started.endPos = endPos
    this.started = undefined
  }
}
