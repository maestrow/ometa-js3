import * as fs from "fs";
import { Parser } from "../parser";
import { ometa1, proj } from './ometa1'

test('ometa1', () => {
  const input = fs.readFileSync('src/grammars/ometa1.ometa', 'utf-8')
  const p = new Parser(ometa1, proj)
  const r = p.match(input as unknown as any[], 'ometa')
  expect(r.result).toEqual(ometa1)
})