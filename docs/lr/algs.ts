import { Ast } from "grammar-ast"
import { State } from "state"
import { IParseResult, IParseResultFail, IParseResultSuccess } from "types"

// ############################################################################
// ### Standard types extensions

declare global {
  interface Array<T>  {
    remove: <T>(element: any) => any;
  }
}

Array.prototype.remove = function (element) {
  const index = this.indexOf(element, 0);
  if (index > -1) {
    return this.splice(index, 1);
  }
  return this;
};


// ############################################################################
// ### Types


type MemoEntry = LR | ANS

type LR = {
  type: 'lr'
  rule: string
  seed: IParseResult
  next?: LR
  head?: Head
}

type ANS = {
  type: 'ans'
  ans: any
}

type Head = {
  rule: string
  involvedSet: string[]
  evalSet: string[]
}

interface Memo {
  has: (rule: string, pos: number) => boolean,
  set: (rule: string, pos: number, value: MemoEntry) => void
  get: (rule: string, pos: number) => MemoEntry
}

// ############################################################################
// ### Functions

const makeLR = (rule: string, next: LR, seed: IParseResult = {success: false}): LR => ({
  type: 'lr',
  rule,
  next,
  seed,
})

const makeAns = (ans: any): ANS => ({
  type: 'ans',
  ans
})

const makeHead = (rule: string): Head => {
  return {
    rule,
    evalSet: [],
    involvedSet: []
  }
}

const hasRule = (head: Head, rule: string) => {
  return head.rule === rule || head.involvedSet.includes(rule)
}




// ############################################################################
// ### Parser Class


class Parser {

  memo: Memo
  state: State
  lrStack: LR[] = []
  heads: Map<number, Head> = new Map()

  protected success(result: any = null, consumed: number = 0): IParseResultSuccess {
    return {
      success: true,
      consumed,
      result
    }
  }
  
  protected fail(): IParseResultFail {
    return {
      success: false
    }
  }

  get isGrowing(): boolean {
    return true
  }

  eval(rule: string): IParseResult {
    return this.success() // заглушка
  }

  // LR functions

  get lrhead(): LR {
    if(this.lrStack.length === 0) {
      return null
    }
    return this.lrStack[this.lrStack.length-1]
  }

  growLr = (rule: string, m: ANS): IParseResult => {
    let pos = this.state.pos
    let res: IParseResult
    for(;;) {
      let res = this.eval(rule)
      if (!res.success || this.state.pos <= pos) {
        break
      }
      m.ans = res
    }
    return m.ans
  }

  setupLr = (rule: string, lr: LR) => {
    lr.head = makeHead(rule)
    for (let i = this.lrStack.length-1; i >=0 ; i--) {
      const stEl = this.lrStack[i];
      if (stEl.rule === rule) {
        break
      }
      lr.head.involvedSet.push(stEl.rule)
    }

  }

  recall = (rule: string, pos: number): MemoEntry => {
    const m = this.memo.get(rule, pos)
    if (!this.heads.has(pos)) {
      return m
    } else {
      const h = this.heads.get(pos)
      // growing is in progress
      if (!m && !hasRule(h, rule)) {
        // Do not evaluate any rule that is not involved in this left recursion.
        return makeAns(this.fail())
      }
      // Allow involved rules to be evaluated, but only once, during a seed-growing iteration
      if (h.evalSet.includes(rule)) {
        h.evalSet.remove(rule)
        const res = this.eval(rule)
        const ans = makeAns(res)
        this.memo.set(rule, pos, ans)
        return ans
      }
    }
  }

  /*
    If the current rule is the head of the left recursion, lrAnswer invokes growLr. 
    Otherwise, the current rule is involved in the left recursion 
    and must defer to the head rule to grow any left-recursive
    parse, and pass its current parse to participate in the construction of a seed parse.
  */
  lrAnswer = (rule: string, pos: number, lr: LR) => {
    const h = lr.head
    if (h.rule !== rule) {
      return lr.seed
    } else {
      if (!lr.seed.success) {
        return lr.seed
      } else {
        return this.growLr(rule, lr)
      }
    }
  }

  applyRule = (rule: string): IParseResult => {
    const pos = this.state.pos
    
    const m = this.recall(rule, pos)
    
    if (!m) {
      const lr = makeLR(rule, this.lrhead) // fail
      

      this.lrStack.push(lr)
      this.memo.set(rule, pos, lr)
      const res = this.eval(rule)
      this.lrStack.pop()
      
      if (lr.head) {
        lr.seed = res
        return this.lrAnswer(rule, pos, lr)
      } else {
        const ans = makeAns(res)
        this.memo.set(rule, pos, ans)
        return res
      }
    } else {
      if (lr.type === 'lr') { // попытка повторно вызвать правило => левая рекурсия
        this.setupLr(rule, lr)
        return lr.seed
      } else {
        return lr.ans
      }
    }
  }

}


