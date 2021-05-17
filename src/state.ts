export class State {

  private _input: Array<any>
  private _len: number
  private _pos: number = 0
  private _inputIsString: boolean
  private savedPos: number[] = [];

  constructor(input: Array<any>) {
    this._input = input
    this._len = input.length
    this._inputIsString = typeof(input) === 'string'
  }

  get input(): Array<any> {
    return this._input
  }

  get len(): number {
    return this._len
  }

  get pos(): number {
    return this._pos
  }

  get isEof(): boolean {
    return this._pos >= this._len
  }

  get current() {
    return this._input[this._pos]
  }

  get isString() {
    return this._inputIsString
  }

  get inputAsString() {
    if (!this.isString) {
      throw new Error("inputAsString can be invoked only on string input");
    }
    return this.input as unknown as string
  }

  at(pos: number) {
    return this._input[pos]
  }

  consume (num: number) {
    this._pos += num
    return !this.isEof
  }

  savePos () {
    this.savedPos.push(this._pos)
  }

  backtrack () {
    this._pos = this.savedPos.pop()
  }

  acceptPos () {
    this.savedPos.pop()
  }
}