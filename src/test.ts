import { Parser } from "./parser";
import { ometa1, proj } from './grammars/ometa1'
import * as fs from "fs";

test('the data is peanut butter', () => {
  const input = fs.readFileSync('src/grammars/ometa1.ometa', 'utf-8')
  const p = new Parser(ometa1, proj)
  const r = p.match(input as unknown as any[], 'ometa')
  //const p = new Parser()
  expect(r.success).toBe(true)
});
