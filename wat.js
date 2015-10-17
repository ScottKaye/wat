'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _templateObject = _taggedTemplateLiteral(['+-><.,[])}({/\'"?~'], ['+-><.,[])}({/\\\'"?~']),
    _templateObject2 = _taggedTemplateLiteral(['\n \t30\'>++++++++[-<+++++++++>]<.>>+>-[+]++>++>+++[>[->+++<<+++>]<<]>-----.>->\n+++..+++.>-.<<+[>[+>+]>>]<--------------.>>.+++.------.--------.>+.>+.\n'], ['\n \t30\'>++++++++[-<+++++++++>]<.>>+>-[+]++>++>+++[>[->+++<<+++>]<<]>-----.>->\n+++..+++.>-.<<+[>[+>+]>>]<--------------.>>.+++.------.--------.>+.>+.\n']);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var Wat = (function () {
	function Wat(str) {
		var _this = this;

		var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		var _ref$stepThrough = _ref.stepThrough;
		var stepThrough = _ref$stepThrough === undefined ? false : _ref$stepThrough;
		var _ref$trace = _ref.trace;
		var trace = _ref$trace === undefined ? false : _ref$trace;

		_classCallCheck(this, Wat);

		this.constructor.max = 3000;
		this.constructor.validChars = [].concat(_toConsumableArray(String.raw(_templateObject)));
		this.memory = new Uint8Array(+str.match(/\d+/) || 5);
		this.dp = 0;
		this.ip = 0;
		this.raw = str;

		this.stepThrough = stepThrough;
		this.trace = trace;

		var openBrackets = 0;
		var brackets = [];

		/*
  b: byte/decimal number
  i: index
  c: command (b, i + optional location to matching bracket `link`)
  */
		this.program = str.split("").map(function (b, i) {
			return { b: b, i: i };
		}).filter(function (c) {
			return _this.constructor.validChars.indexOf(c.b) >= 0;
		}).map(function (c, i, a) {
			var m = null;

			//Find matching braces for [ and ]
			switch (c.b) {
				case '[':
					++openBrackets;
					brackets[openBrackets] = {};
					brackets[openBrackets].open = i;
					break;
				case ']':
					//Update links ([ stores the location of ], and vice-versa)
					c.link = brackets[openBrackets].open;
					a[brackets[openBrackets].open].link = i;
					--openBrackets;
					break;
			}

			return c;
		});
	}

	_createClass(Wat, [{
		key: 'commands',
		value: regeneratorRuntime.mark(function commands() {
			var command;
			return regeneratorRuntime.wrap(function commands$(context$2$0) {
				while (1) switch (context$2$0.prev = context$2$0.next) {
					case 0:
						command = this.program[this.ip++];

						if (!command) {
							context$2$0.next = 4;
							break;
						}

						context$2$0.next = 4;
						return command;

					case 4:
						return context$2$0.abrupt('return');

					case 5:
					case 'end':
						return context$2$0.stop();
				}
			}, commands, this);
		})
	}, {
		key: 'run',
		value: function run() {
			var memory = this.memory;
			var dp = this.dp;
			var raw = this.raw;
			var trace = this.trace;

			var output = "",
			    copyOver = true,
			    quoteOpen = false,
			    bracketsOpen = 0;
			var max = this.constructor.max;
			var command = this.commands().next();

			var start = performance.now();

			while (!command.done && --max) {
				var prev = undefined;

				if (trace) {
					console.log(command.value);
				}

				switch (command.value.b) {
					case '>':
						prev = memory[dp];
						if (++dp > memory.length - 1) dp = 0;
						if (copyOver) {
							memory[dp] = prev;
						}
						break;
					case '<':
						prev = memory[dp];
						if (--dp < 0) dp = memory.length - 1;
						if (copyOver) {
							memory[dp] = prev;
						}
						break;
					case '+':
						memory[dp] = (memory[dp] || 0) + 1;
						break;
					case '-':
						memory[dp] = (memory[dp] || 0) - 1;
						break;
					case '.':
						output += String.fromCharCode(memory[dp]);
						break;
					case ',':
						var input = prompt('Input');
						if (input === null) max = 0;else memory[dp] = input;
						break;
					case '[':
						if (memory[dp] === 0) {
							var searchCommand = this.program[this.ip - 1];
							this.ip = searchCommand.link;
						}
						break;
					case ']':
						if (memory[dp] !== 0) {
							//Move back to matching [
							var searchCommand = this.program[this.ip - 1];
							this.ip = searchCommand.link;
						}
						break;
					//Add
					case ')':
						memory[dp] = memory.reduce(function (p, c) {
							return p + c;
						});
						break;
					//Multiply
					case '(':
						var total = 1;
						memory.filter(function (b) {
							return b;
						}).forEach(function (b) {
							return total *= b;
						});
						memory[dp] = total;
						break;
					//Subtract
					case '}':
						memory[dp] = memory.reduce(function (p, c) {
							return p - c;
						});
						break;
					//Divide
					case '{':
						memory[dp] = memory.filter(function (b) {
							return b;
						}).reduce(function (p, c) {
							return p / c;
						});
						break;
					//Move & clear
					case '/':
						memory[0] = memory[dp];
						memory.fill(0, 1 - +!dp);
						dp = 0;
						break;
					//Add all to output as ASCII
					case '\\':
						memory.forEach(function (b) {
							return output += String.fromCharCode(b);
						});
						break;
					//Toggle copyOver
					case '\'':
						copyOver = !copyOver;
						break;
					//Get single input
					case '?':
						var value = raw[command.value.i - 1];

						//If the value given is an number, don't conver it to a char code
						if (isNaN(value)) {
							value = value.charCodeAt(0);
						}

						memory[dp] = value;
						break;
					//Get stream of input
					case '"':
						quoteOpen = !quoteOpen;
						//If this is the start quote
						if (quoteOpen) {
							//Read everything until the next " into respective cells, starting at dp
							var first = command.value.i + 1;
							var sub = raw.slice(first, raw.indexOf('"', first));
							--dp;

							//Numbers over 2 digits long will be inserted directly (as numbers)
							//Everything else gets converted to its ASCII code
							sub.split(/[^0-9]/g).forEach(function (b) {
								if (isNaN(b)) b = b.charCodeAt(0);
								memory[++dp] = b;
							});
						}
						break;
				}

				command = this.commands().next();
			}

			var end = performance.now();
			var time = (end - start).toFixed(4);

			if (max <= 0) console.error("Overflowed!");

			console.log("Memory\t\t", memory);
			console.log("Output\t\t", output);
			console.log("Time (ms)\t", time);

			//Clean up final object
			delete this.bracketsOpen;
			delete this.quoteOpen;
			delete this.copyOver;

			this.dp = dp;
		}
	}]);

	return Wat;
})();

var wat = new Wat(String.raw(_templateObject2), {
	stepThrough: true,
	trace: false
});

var wat2 = new Wat('++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.');

wat.run();
console.log(wat);
