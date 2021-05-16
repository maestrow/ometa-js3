import { Parser } from "./parser";
import { ometa1, proj } from './grammars/ometa1'
import * as fs from "fs";

test('the data is peanut butter', () => {
  const input = fs.readFileSync('src/step2/grammars/ometa1.ometa', 'utf-8')
  const p = new Parser(ometa1, input as unknown as any[], proj)
  const r = p.match('ometa')
  //const p = new Parser()
  expect(r.success).toBe(true)
});
