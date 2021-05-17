import * as fs from "fs";
import { Parser } from './parser'
import { ometa1, proj } from './grammars/ometa1'
import { TraceDiscovery } from "./utils/trace-discover";


const input = fs.readFileSync('src/step2/grammars/ometa1.ometa', 'utf-8')


const p = new Parser(ometa1, input as unknown as any[], proj)
const r = p.match('ometa')


console.dir(r, {depth: null})
const disco = new TraceDiscovery(ometa1, input, p.trace.data)
const trace = disco.convert()

