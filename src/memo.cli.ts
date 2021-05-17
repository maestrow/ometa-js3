import { Ast } from "grammar-ast"
import { IParserFn } from "types"
import {Memoize, MemoizeExpiring} from 'typescript-memoize';
import { getRuleBodyByName } from "./utils";

/*

Возьмем для теста грамматику:

ometa o {
  a = b '-' c
  b = a '-' c
  c = '*'
}

Она примечательна тем, что:
- рукурсивна
- в разных ее частях есть одинаковые выражения: литерал '-' и применения правила "c".

Мемоизация решает следующие задачи, которые будут протестированы в этом модуле:
- предотвращает вход в бесконечную рекурсию при получении парсера по выражению
- функция получения парсера для некоторого выражения X вызывается только один раз. При последующих вызовах возвращается значение из кеша.

По описанной выше грамматике запишем ее AST:
*/

const gr1 = [
  ['a', ['seq', [['rule', 'b'], ['equal', '-'], ['rule', 'c']]]],
  ['b', ['seq', [['rule', 'a'], ['equal', '-'], ['rule', 'c']]]],
  ['c', ['eqaul', '*']]
]

/*

Реализуем отдельный класс MockParser, в котором будут реализованы базовые комбинаторы, присутствующие в грамматике:
- seq
- rule
- equal

*/


class MockParser {

  grammar: any[]

  constructor (gr) {
    this.grammar = gr
    this.expr = this.expr.bind(this)
  }


  // @Memoize((...args) => JSON.stringify(args))
  expr (e: Ast.Expr): IParserFn {
    const combinator = this[e[0]]
    return combinator.apply(this, e.slice(1))
  }

  rule = (name: string) => {
    const expr = getRuleBodyByName(name, this.grammar)
    return () => ['parser rule', name]
  }

  seq = (exprs: any[]) => {
    const parsers = exprs.map(this.expr)
    return () => {
      const results = parsers.map(p => p())
      return ['parser seq', ...results]
    }
  }

  equal = (value: string) => {
    return () => {
      return ['parser equal', value]
    }
  }
}

const p = new MockParser(gr1)
const fn = p.expr(['rule', 'a'])
const res = fn()

console.log(res)
// test('', () => {

// })