import { Ast as AST } from '../grammar-ast'

/*

ometa {
  expr = group (op group)*,
  group = '(' expr ')' | num,
  op = '-'|'+'|'*'|'/',
  num = digit+,
  digit = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'
}

*/

export const math1: AST.Grammar = [
  ['expr', ['seq', [
    ['rule', 'group'],
    ['times', 0, null, ['seq', [
      ['rule', 'op'],
      ['rule', 'group']
    ]]]
  ]]],
  ['group', ['alt', [
    ['seq', [
      ['equal', '('],
      ['rule', 'expr'],
      ['equal', ')'],
    ]],
    ['rule', 'num']
  ]]],
  ['op', ['alt', [
    ['equal', '-'],
    ['equal', '+'],
    ['equal', '*'],
    ['equal', '/'],
  ]]],
  ['num', ['times', 1, null, ['rule', 'digit']]],
  ['digit', ['alt', [
    ['equal', '0'],
    ['equal', '1'],
    ['equal', '2'],
    ['equal', '3'],
    ['equal', '4'],
    ['equal', '5'],
    ['equal', '6'],
    ['equal', '7'],
    ['equal', '8'],
    ['equal', '9'],
  ]]]
]