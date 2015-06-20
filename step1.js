var MyGrammar = function () {

};

MyGrammar.prototype.match = function (input) {
  return "ok";
};

var g = new MyGrammar();

console.log(g.match('1+2'));