export class State {

  private _input: Array<any>
  private _len: number
  private _pos: number = 0;

  private savedPos: number[] = [];

  constructor(input: Array<any>) {
    this._input = input
    this._len = input.length
  }

  get input(): Array<any> {
    return this._input
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