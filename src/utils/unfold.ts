const unfoldRec = (expr: any, op: string) => {
  return expr[1].reduce((acc, i) => {
    if (i instanceof Array && i[0] === op) {
      return acc.concat(unfoldRec(i, op))
    } else {
      acc.push(i)
      return acc
    }
  }, [])
}


export const unfold = (expr: any) => {
  const op = expr[0]
  return [op, unfoldRec(expr, op)]
}