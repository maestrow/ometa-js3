import { GrammarAst as AST } from '../grammar-ast'

export const math1: AST.Grammar = [
  ['expr', ['seq', [
    ['rule', 'group'],
    ['notLess', 0, ['seq', [
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
  ['num', ['notLess', 1, ['rule', 'digit']]],
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