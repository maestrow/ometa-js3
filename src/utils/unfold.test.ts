import { unfold } from "./unfold"



describe('unfold', () => {
  test('all', () => {
    const arr = ['seq', [
      ['seq', [
        ['seq', [1, 2]], 
        3,
      ]], 
      4,
    ]]
    const r = unfold(arr)
    expect(r).toEqual([ 'seq', [1, 2, 3, 4] ])
  })

  test('some', () => {
    const arr = ['seq', [
      ['seq', [
        ['www', [1, 2]], 
        3,
      ]], 
      4,
    ]]
    const r = unfold(arr)
    expect(r).toEqual(["seq",[["www",[1,2]],3,4]])
  })
})