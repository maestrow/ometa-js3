# Концепция OMeta

Конспект документа ["Experimenting with Programming Languages.
A dissertation submitted in partial satisfaction
of the requirements for the degree
Doctor of Philosophy in Computer Science" by Alessandro Warth](http://www.vpri.org/pdf/tr2008003_experimenting.pdf).

OMeta: An Object-Oriented Language for Pattern-Matching.

OMeta: an extended PEG

<table>
<tr>
  <th>Выражение</td>
  <th>Смысловое значение</td>
</tr>
<tr>
  <td>e1 e2</td>
  <td>Последовательность</td>
</tr>
<tr>
  <td>e1 | e2</td>
  <td>Приоритезированный выбор</td>
</tr>
<tr>
  <td>e*</td>
  <td>Ноль или более повторений</td>
</tr>
<tr>
  <td>e+</td>
  <td>Одно или более повторений</td>
</tr>
<tr>
  <td>(e)</td>
  <td>Группировка</td>
</tr>
<tr>
  <td>~e</td>
  <td>Отрицание</td>
</tr>
<tr>
  <td>&e</td>
  <td>Заглядывание вперед</td>
</tr>
<tr>
  <td>r</td>
  <td>Применение правила</td>
</tr>
<tr>
  <td>'x'</td>
  <td>Символ x</td>
</tr>
</table>

e, e1, e2 - выражения, r - нетерминал (имя правила).

## Переменные и результирующие выражения

```
exp = exp:x ’+’ fac:y -> [’add’, x, y]
    | exp:x ’-’ fac:y -> [’sub’, x, y]
    | fac
```

Если результирующее выражении не указано, то результат сопоставления будет равен входящему значению, т.е. `fac` эквивалентно `fac:x -> x`

## anything

В OMeta есть встроенное правило `anything`, от которого наследуются все остальные. Правило `anything` получает из входящего потока один элемент.

`end = ˜anything` - конец вхадящего потока

## Предикаты

`digit = char:d ?(d >= ’0’ && d <= ’9’) -> d`

## Входящий поток - не только символы

PEG оперируют входящим потоком символов. OMeta оперирует потоком объектов.

`'abc'` - сопставление со строкой
`42` - сопоставление с числом
`['abc', 42, []]` - сопоставление со списком объектов

Примеры:
* `[anything*]` - любой список
* `[]` - пустой список

```
ometa ExpEvaluator {
eval = [’num’ anything:x] -> x
    | [’add’ eval:x eval:y] -> (x + y)
    | [’sub’ eval:x eval:y] -> (x - y)
    | [’mul’ eval:x eval:y] -> (x * y)
    | [’div’ eval:x eval:y] -> (x / y)
}
```

## Левая рекурсия


```
fac = fac:x ’*’ num:y -> [’mul’, x, y]
    | fac:x ’/’ num:y -> [’div’, x, y]
    | num,
```

## Параметризированные правила

```
charRange :x :y = char:c ?(x <= c && c <= y) -> c
lowerCase = charRange(’a’, ’z’)
```

```
eq = ’=’ -> {kind: ’=’, value: ’=’},
num = digit+:ds -> {kind: ’num’, value: parseInt(ds.join(’’))},
id = letter+:ls -> {kind: ’id’, value: ls.join(’’)},
scanner = space* (eq | num | id),
token :k = scanner:t ?(t.kind == k) -> t.value,
assign = token(’id’) token(’=’) token(’num’)
```

## Внутреннее правило `token`

Чтобы упростить написание подобных выражений: `token(’id’) token(’=’) token(’num’)` в OMeta существует внутреннее правило:

`token :t = space* string(t) -> t`

и способ вызова данного правила при помощи кавычек. Например:

`condStmt = "if" "(" expr:c ")" stmt:tb "else" stmt:fb -> ...`

## Сопоставление по шаблону над входящими параметрами

На самом деле выражение `charRange :x :y = ...` это краткая форма выражения:  `charRange anything:x anything:y = ...`

## Множественные определения правила

```
fact 0 = -> 1,
fact :n = fact(n - 1):m -> (n * m)
```

## Правила высшего порядка

Данный механизм позволяет правилам принимать в качестве аргументов имена других правил.

`listOf :p = apply(p) ("," apply(p))*`

Данное определение позволяет сопоставить список любых объектов.

## O значит Объектно-ориентированный

Пример наследования и обращения к правилу, определенному в базовой граппатике:

```
ometa EJSParser <: JSParser {
  isKeyword :x = ?(x == ’say’)
              | ˆisKeyword(x),
  stmt = "say" expr:x sc -> [’call’, [’get’, ’alert’], x]
      | ˆstmt
}
```

## Хранение состояния

Грамматики позволяют хранить переменные экземпляра.

```
ometa Calc <: Parser {
  var = letter:x -> x,
  num = num:n digit:d -> (n * 10 + d.digitValue())
      | digit:d -> d.digitValue(),
  priExpr = spaces var:x -> self.vars[x]
          | spaces num:n -> n
          | "(" expr:r ")" -> r,
  mulExpr = mulExpr:x "*" priExpr:y -> (x * y)
          | mulExpr:x "/" priExpr:y -> (x / y)
          | priExpr,
  addExpr = addExpr:x "+" mulExpr:y -> (x + y)
          | addExpr:x "-" mulExpr:y -> (x - y)
          | mulExpr,
  expr = var:x "=" expr:r -> (self.vars[x] = r)
      | addExpr,
  doit = (expr:r)* spaces end -> r
}
Calc.initialize = function() { this.vars = {}; }
```


## Обращение к внешним грамматикам

```
ometa OMetaJSParser {
  topLevel = foreign(OMetaParser, ’grammar’)
           | foreign(JSParser, ’srcElem’)
}
```
