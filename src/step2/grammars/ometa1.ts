import { IProjectors } from 'step2/types'
import { Ast as AST } from '../grammar-ast'

/*

Выражения располагаются в порядке приоритета (внизу - наибольший приоритет)


ometa Ometa1 {
  ometa = "ometa" ident "{" eRule* "}" spaces,
  eRule = ident "=" "|"? eTop inlSpaces ',' newline,

  eTop    = eAlt,
  eAlt    = eProj ("|" eProj)*,
  eProj   = eSeq ("->" ident)?,
  eSeq    = eQuant (spaces1 quant)*,
  eQuant  = eNot ('?' | '*' | '+')?,
  eNot    = '~'? operand,

  operand = 
    | '(' eTop ') -> op_group
    | eRange      -> op_range
    | eStr        -> op_str
    | eToken      -> op_token
    | eRegex      -> op_regex
    | ident       -> op_rule,
  
  eRange  = alphanum '-' alphanum,
  eStr    = "'" (~'\'' anything)* '\'',
  eToken  = "\"" (~'"' anything)* '"',
  eRegex  = "/" (~'/' anything)* '/' a-z*,

  ident  = spaces letter alphanum*,

  alphanum = letter | digit,
  digit    = 0-9,
  letter   = A-Z | a-z,

  spaces     = /\s* /,
  spaces1    = /\s+/,
  space      = /\s/,
  inlSpaces  = /[ \t]* /, 
  inlSpaces1 = /[ \t]+/, 
  inlSpace   = /[ \t]/,
  newline    = /(\r\n)|\n/,
}

*/

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
    ['times', 0, 1, ['token', '|']],
    ['rule', 'eTop'],
    ['rule', 'inlSpaces'],
    ['equal', ','],
    ['rule', 'newline'],
  ]]],
  
  ['eTop', ['rule', 'eAlt']],
  
  ['eAlt', ['seq', [
    ['rule', 'eProj'],
    ['times', 0, null, ['seq', [['equal', '|'], ['rule', 'eProj']]]]
  ]]],
  
  ['eProj', ['seq', [
    ['rule', 'eSeq'],
    ['times', 0, 1, ['seq', [['equal', '->'], ['rule', 'ident']]]],
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
      ['equal', '('],
      ['rule', 'eTop'],
      ['equal', ')'],
    ]]],
    ['project', 'op_range', ['rule', 'eRange']],
    ['project', 'op_str', ['rule', 'eStr']],
    ['project', 'op_token', ['rule', 'eToken']],
    ['project', 'op_regex', ['rule', 'eRegex']],
    ['project', 'op_rule', ['rule', 'ident']],
  ]]],
  
  ['eRange', ['seq', [
    ['rule', 'alphanum'],
    ['equal', '-'],
    ['rule', 'alphanum'],
  ]]],
  
  ['eStr', ['seq', [
    ['token', '\''],
    ['times', 0, null, ['seq', [['not', ['equal', '\'']], ['rule', 'anything']]]],
    ['equal', '\''],
  ]]],
  
  ['eToken', ['seq', [
    ['token', '"'],
    ['times', 0, null, ['seq', [['not', ['equal', '"']], ['rule', 'anything']]]],
    ['equal', '"'],
  ]]],
  
  ['eRegex', ['seq', [
    ['token', '/'],
    ['times', 0, null, ['seq', [['not', ['equal', '/']], ['rule', 'anything']]]],
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