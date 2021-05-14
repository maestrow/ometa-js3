import { IProjectors } from 'step2/types'
import { Ast as AST } from '../grammar-ast'

export const ometa1: AST.Grammar = [
  ['ometa', ['seq', [
    ['token', 'ometa'],
    ['rule', 'ident'],
    ['token', '{'],
    ['times', 0, null, ['rule', 'eRule']],
    ['token', '}'],
    ['rule', 'spaces']
  ]]],
  
  ['eRule', ['seq', [
    ['rule', 'ident'],
    ['token', '='],
    ['rule', 'spaces'],
    ['times', 0, 1, ['token', '|']],
    ['rule', 'eTop'],
    ['rule', 'inlSpaces'],
    ['equal', ','],
    ['rule', 'newline'],
  ]]],
  
  ['eTop', ['rule', 'eAlt']],
  
  ['eAlt', ['seq', [
    ['rule', 'eProj'],
    ['times', 0, null, ['seq', [['token', '|'], ['rule', 'eProj']]]]
  ]]],
  
  ['eProj', ['seq', [
    ['rule', 'eSeq'],
    ['times', 0, 1, ['seq', [['token', '->'], ['rule', 'ident']]]],
  ]]],
  
  ['eSeq', ['seq', [
    ['rule', 'eQuant'],
    ['times', 0, null, ['seq', [['rule', 'spaces1'], ['rule', 'eQuant']]]],
  ]]],
  
  ['eQuant', ['seq', [
    ['rule', 'eNot'],
    ['times', 0, 1, ['alt', [
      ['equal', '?'],
      ['equal', '*'],
      ['equal', '+'],
    ]]]
  ]]],
  
  ['eNot', ['seq', [
    ['times', 0, 1, ['equal', '~']],
    ['rule', 'operand']
  ]]],
  
  ['operand', ['alt', [
    ['project', 'op_group', ['seq', [
      ['token', '('],
      ['rule', 'eTop'],
      ['token', ')'],
    ]]],
    ['project', 'opRange', ['rule', 'eRange']],
    ['project', 'opStr', ['rule', 'eStr']],
    ['project', 'opToken', ['rule', 'eToken']],
    ['project', 'opRegex', ['rule', 'eRegex']],
    ['project', 'opRule', ['rule', 'ident']],
  ]]],
  
  ['eRange', ['seq', [
    ['rule', 'spaces'],
    ['rule', 'alphanum'],
    ['equal', '-'],
    ['rule', 'alphanum'],
  ]]],
  
  ['eStr', ['seq', [
    ['token', '\''],
    ['times', 0, null, ['seq', [
      ['not', ['equal', '\'']], 
      ['times', 0, 1, ['equal', '\\']],
      ['anything']
    ]]],
    ['equal', '\''],
  ]]],
  
  ['eToken', ['seq', [
    ['token', '"'],
    ['times', 0, null, ['seq', [
      ['not', ['equal', '"']], 
      ['times', 0, 1, ['equal', '\\']],
      ['anything']
    ]]],
    ['equal', '"'],
  ]]],
  
  ['eRegex', ['seq', [
    ['token', '/'],
    ['times', 0, null, ['seq', [
      ['not', ['equal', '/']], 
      ['times', 0, 1, ['equal', '\\']],
      ['anything']
    ]]],
    ['equal', '/'],
    ['times', 0, null, ['range', 'a', 'z']],
  ]]],
  
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


export const proj: IProjectors = {

}