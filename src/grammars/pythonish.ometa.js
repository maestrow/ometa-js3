ometa`Pythonish {
  prog = statement+
  statement = indent:i ?checkIndent ident:id /\s*/ newline (&indent:nextIndent ?levelUp statement+ ?levelDown)

  indent = /\s*/
}`

const initState = () => ({
  indent: [0] // indentation stack
})

const custom = {

  indent (val) {
    return val.length 
  },

  checkIndent () {
    const currIndent = this.vars.i
    const indentStack = this.state.indent
    const head = indentStack[indentStack.length-1]

    return currIndent === head
  },

  levelUp () {
    const currIndent = this.vars.i
    const nextIndent = this.vars.nextIndent
    const indentStack = this.state.indent
    const head = indentStack[indentStack.length-1]

    if (nextIndent > currIndent) {
      this.state.indent.push(nextIndent)
      return true
    }
    return false
  },

  levelDown () {
    this.state.indent.pop()
  },

  statement () {
    return [this.vars.i, this.vars.id] // indent, statement
  }
}

/*
checkIndent (): IParserResult {
  const i = this.vars.i
  const indentStack = this.state.indent
  const head = indentStack[indentStack.length-1]

  if (i === head) {
    return true
  } else if (i > head) {
    indentStack.push(i)
    return this.success()
  } else if (i < head) {
    const idx = indentStack.findIndex(s => s === i)
    if (idx > -1) {
      this.state.indent = indentStack.slice(0, idx+1)
      return this.success()
    } else {
      return this.fail('indentation fail')
    }
  }
},
*/