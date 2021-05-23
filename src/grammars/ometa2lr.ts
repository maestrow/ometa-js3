import { IProjectors } from '../types'
import { Ast, Ast as AST } from '../grammar-ast'
import { unfold } from 'utils/unfold'

export const ometa2lr: AST.Grammar = [
  ['ometa', ['seq', [
    ['token', 'ometa'],
    ['rule', 'ident'],
    ['token', '{'],
    ['times', 0, null, ['rule', 'rule']],
    ['token', '}'],
    ['rule', 'spaces']
  ]]],

  ['rule', ['seq', [
    ['rule', 'ident'],
    ['token', '='],
    ['rule', 'spaces'],
    ['times', 0, 1, ['token', '|']],
    ['rule', 'expr'],
    ['rule', 'inlSpaces'],
    ['equal', ','],
    ['rule', 'newline'],
  ]]],

  ['expr', ['lr', ['alt', [
    ['rule', 'alt'],
    ['rule', 'proj'],
    ['rule', 'seq'],
    ['rule', 'quant'],
    ['rule', 'not'],
    ['rule', 'expr2'],
  ]]]],

  ['expr2', ['alt', [
    ['project', 'opRange', ['rule', 'range']],
    ['project', 'opStr', ['rule', 'str']],
    ['project', 'opToken', ['rule', 'token']],
    ['project', 'opRegex', ['rule', 'regex']],
    ['project', 'opRule', ['rule', 'ident']],
    ['project', 'opGroup', ['rule', 'group']],
  ]]],

  ['group', ['seq', [
    ['token', "("],
    ['rule', 'expr'],
    ['token', ')'],
  ]]],

  ['alt', ['seq', [
    ['rule', 'expr'],
    ['token', '|'],
    ['rule', 'expr'],
  ]]],

  ['proj', ['seq', [
    ['rule', 'expr'],
    ['token', '->'],
    ['rule', 'ident'],
  ]]],

  ['seq', ['seq', [
    ['rule', 'expr'],
    ['rule', 'spaces1'],
    ['rule', 'expr'],
  ]]],

  ['quant', ['seq', [
    ['rule', 'expr2'],
    ['alt', [
      ['equal', '?'],
      ['equal', '*'],
      ['equal', '+'],
    ]],
  ]]],

  ['not', ['seq', [
    ['equal', '~'],
    ['rule', 'expr2'],
  ]]],

  // Part 2

  ['range', ['seq', [
    ['rule', 'spaces'],
    ['rule', 'alphanum'],
    ['equal', '-'],
    ['rule', 'alphanum'],
  ]]],

  ['str', ['seq', [
    ['token', '\''],
    ['times', 0, null, ['seq', [
      ['not', ['equal', '\'']],
      ['times', 0, 1, ['equal', '\\']],
      ['anything']
    ]]],
    ['equal', '\''],
  ]]],

  ['token', ['seq', [
    ['token', '"'],
    ['times', 0, null, ['seq', [
      ['not', ['equal', '"']],
      ['times', 0, 1, ['equal', '\\']],
      ['anything']
    ]]],
    ['equal', '"'],
  ]]],

  ['regex', ['seq', [
    ['token', '/'],
    ['times', 0, null, ['seq', [
      ['not', ['equal', '/']],
      ['times', 0, 1, ['equal', '\\']],
      ['anything']
    ]]],
    ['equal', '/'],
    ['times', 0, null, ['range', 'a', 'z']],
  ]]],

  // part 3

  ['ident', ['seq', [
    ['rule', 'spaces'],
    ['rule', 'letter'],
    ['times', 0, null, ['rule', 'alphanum']]
  ]]],

  ['alphanum', ['alt', [['rule', 'letter'], ['rule', 'digit']]]],

  ['digit', ['range', '0', '9'],],

  ['letter', ['alt', [
    ['range', 'A', 'Z'],
    ['range', 'a', 'z'],
  ]]],

  ['spaces', ['regex', '\\s*']],
  ['spaces1', ['regex', '\\s+']],
  ['space', ['regex', '\\s']],
  ['inlSpaces', ['regex', '[ \\t]*']],
  ['inlSpaces1', ['regex', '[ \\t]+']],
  ['inlSpace', ['regex', '[ \\t]']],
  ['newline', ['regex', '(\\r\\n)|\\n']],
]

const strMap = (value) => value.map(i => i[2]).join('')
const rxMap = (value) => value.map(i => (i[1].length ? '\\' : '') + i[2]).join('')
const internalRules = ['anything']

export const ometa2lrProj: IProjectors = {
  ometa: ([_1, ident, _2, rules]) => rules,

  rule: ([ident, _2, _3, _4, expr]) => [ident, expr],
  alt: ([first, _, second]) => unfold(['alt', [first, second]]),
  proj: ([expr, _, ident]) => ['project', ident, expr],
  seq: ([first, _, second]) => unfold(['seq', [first, second]]),
  quant: ([value, op]) => {
    switch (op) {
      case '*':
        return ['times', 0, null, value]
      case '+':
        return ['times', 1, null, value]
      case '?':
        return ['times', 0, 1, value]
    }
    throw new Error("Unexpected op in quantifier: " + op);
  },
  not: ([_1, value]) => ['not', value],

  opGroup: ([_1, value]) => value,
  opRule: (ident) => internalRules.includes(ident as unknown as string)
    ? [ident]
    : ['rule', ident],

  range: ([_1, from, _2, to]) => ['range', from, to],
  str: ([_1, value]) => ['equal', strMap(value)],
  token: ([_1, value]) => ['token', strMap(value)],
  regex: ([_1, value, _2, modif]) => ['regex', rxMap(value)],
  ident: ([_, first, rest]) => first + rest.join(''),
}