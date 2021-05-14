import { Templates, Compiler, TemplatesTrace } from "./ast2ometa";
import { ometa1 } from "./grammars/ometa1";
import { getRuleBodyByName } from "./utils";

const c = new Compiler(new Templates())
const res = c.compile(ometa1, "Ometa")



console.log(res)