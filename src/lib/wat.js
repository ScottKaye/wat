"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _templateObject = _taggedTemplateLiteral(["+-><.,[](){}/!'\"?"], ["+-><.,[](){}/!'\"?"]);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

if (self.importScripts) {
	self.importScripts("browser-polyfill.min.js");
	self.importScripts("wat-static.js");

	self.addEventListener("message", function (msg) {
		var wat = new Wat(msg.data.program, msg.data.options);
		self.postMessage(wat.run());
	}, false);
}

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
		this.constructor.mapping = {
			'>': this.right,
			'<': this.left,
			'+': this.inc,
			'-': this.dec,
			'.': this.print,
			',': this.get,
			'[': this.openLoop,
			']': this.closeLoop,
			'(': this.add,
			')': this.sub,
			'{': this.mult,
			'}': this.div,
			'/': this.reset,
			'!': this.printAll,
			"'": this.toggleCopyOver,
			'?': this.read,
			'"': this.readStream
		};

		//Use first number as size, or default to 5
		this.memory = new Uint8Array(+str.match(/\d+/) || 5);
		this.dp = 0;
		this.ip = 0;
		this.raw = str;

		this.output = "";
		this.copyOver = true;
		this.quoteOpen = false;
		this.bracketsOpen = 0;

		this.stepThrough = stepThrough;
		this.trace = trace;
		this._trace = [];

		var openBrackets = 0;
		var brackets = [];

		//Splits raw program into groups that are not inside quotes (literals), then splits each match into character arrays
		var bytes = WatStatic.getRawCommands(str);

		/*
  b: byte/decimal number
  i: index
  c: command (b, i + optional location to matching bracket `link`)
  */

		//Creates parsed program containing only commands that do things
		//Each command is stored with its value and its index in the raw program
		//Loop brackets are matched, and their links are stored on their command object
		this.program = bytes.map(function (b, i) {
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

	//Generator to return each command as they are processed

	_createClass(Wat, [{
		key: "commands",
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
						return context$2$0.abrupt("return");

					case 5:
					case "end":
						return context$2$0.stop();
				}
			}, commands, this);
		})

		//Move data pointer right, or wrap
	}, {
		key: "right",
		value: function right() {
			var prev = this.memory[this.dp];
			if (++this.dp > this.memory.length - 1) this.dp = 0;
			if (this.copyOver) {
				this.memory[this.dp] = prev;
			}
		}

		//Move data pointer left, or wrap
	}, {
		key: "left",
		value: function left() {
			var prev = this.memory[this.dp];
			if (--this.dp < 0) this.dp = this.memory.length - 1;
			if (this.copyOver) {
				this.memory[this.dp] = prev;
			}
		}

		//Increment cell at data pointer
	}, {
		key: "inc",
		value: function inc() {
			this.memory[this.dp] = (this.memory[this.dp] || 0) + 1;
		}

		//Decrement cell at data pointer
	}, {
		key: "dec",
		value: function dec() {
			this.memory[this.dp] = (this.memory[this.dp] || 0) - 1;
		}

		//Add cell at data pointer to output
	}, {
		key: "print",
		value: function print() {
			this.output += String.fromCharCode(this.memory[this.dp]);
		}

		//Add all cells to output
	}, {
		key: "printAll",
		value: function printAll() {
			var _this2 = this;

			this.memory.forEach(function (b) {
				_this2.output += String.fromCharCode(b);
			});
		}

		//Prompt for user input
	}, {
		key: "get",
		value: function get() {
			var input = prompt('Input');
			if (input === null) this.constructor.max = 0;else {
				if (isNaN(input)) input = input.charCodeAt(0);
				this.memory[this.dp] = input;
			}
		}

		//Jumps to close brace if current cell is 0
	}, {
		key: "openLoop",
		value: function openLoop() {
			if (this.memory[this.dp] === 0) {
				//Move ahead to matching ]
				var searchCommand = this.program[this.ip - 1];
				this.ip = searchCommand.link;
			}
		}

		//Jumps to open brace if current cell is not 0
	}, {
		key: "closeLoop",
		value: function closeLoop() {
			if (this.memory[this.dp] !== 0) {
				//Move back to matching [
				var searchCommand = this.program[this.ip - 1];
				this.ip = searchCommand.link;
			}
		}

		//Stores the result of adding all cells to the current cell
	}, {
		key: "add",
		value: function add() {
			this.memory[this.dp] = this.memory.reduce(function (p, c) {
				return p + c;
			});
		}

		//Stores the result of subtracting all cells to the current cell
	}, {
		key: "sub",
		value: function sub() {
			this.memory[this.dp] = this.memory.reduce(function (p, c) {
				return p - c;
			});
		}

		//Stores the result of multiplying all non-zero cells to the current cell
	}, {
		key: "mult",
		value: function mult() {
			var total = 1;
			this.memory.filter(function (b) {
				return b;
			}).forEach(function (b) {
				return total *= b;
			});
			this.memory[this.dp] = total;
		}

		//Stores the result of divigind all non-zero cells to the current cell
	}, {
		key: "div",
		value: function div() {
			this.memory[this.dp] = this.memory.filter(function (b) {
				return b;
			}).reduce(function (p, c) {
				return p / c;
			});
		}

		//Moves the current cell value to cell 0, moves the data pointer to 0, clear all cells except 0
		//If the data pointer is already at 0, clear all cells
	}, {
		key: "reset",
		value: function reset() {
			this.memory[0] = this.memory[this.dp];
			this.memory.fill(0, 1 - +!this.dp);
			this.dp = 0;
		}

		//Toggles a flag deciding whether or not to copy values when moving the data pointer
	}, {
		key: "toggleCopyOver",
		value: function toggleCopyOver() {
			this.copyOver = !this.copyOver;
		}

		//Inserts the character immediately preceding this command to the current cell
		//If that character is a number, insert it directly, otherwise insert its ASCII code
	}, {
		key: "read",
		value: function read(i) {
			var value = this.raw[i - 1];

			//If the value given is not a number (or is a space), convert it to its ASCII code
			if (isNaN(value) || value.charCodeAt(0) === 32) {
				value = value.charCodeAt(0);
			} else {
				//Attempt to find all parts of the number, in case it is multiple digits long
				var nums = [];
				var current = this.raw[--i].trim();
				while (!isNaN(current) && current.length > 0 && --this.constructor.max) {
					nums.push(current);
					current = this.raw[--i];
					if (current) current = current.trim();
				}
				value = +nums.reverse().join("");
			}

			this.memory[this.dp] = value;
		}

		//Similar to read, except this reads every character until a closing " is found
		//Each insertion (every character) increments the data pointer
	}, {
		key: "readStream",
		value: function readStream(i) {
			var _this3 = this;

			this.quoteOpen = !this.quoteOpen;

			//If this is the start quote
			if (this.quoteOpen) {
				var copyOver = this.copyOver;

				this.copyOver = false;

				//Read everything until the next " into respective cells, starting at dp
				var first = i + 1;
				var sub = this.raw.slice(first, this.raw.indexOf("\"", first));
				this.left();

				//Inserts every character as an ASCII code
				//Numbers will be converted to strings (30 => [51, 48])
				sub.match(/(.+?)/gi).forEach(function (b) {
					b = b.charCodeAt(0);
					_this3.right();
					_this3.memory[_this3.dp] = b;
				});

				this.copyOver = copyOver;
			}
		}
	}, {
		key: "run",
		value: function run() {
			var command = this.commands().next();

			var start = performance.now();

			while (!command.done && --this.constructor.max) {
				if (this.trace) {
					this._trace.push(command.value);
				}

				//Execute command from mapping, if the mapping exists
				var fn = this.constructor.mapping[command.value.b];
				if (fn) {
					fn.call(this, command.value.i);
				}

				command = this.commands().next();
			}

			var end = performance.now();
			var time = (end - start).toFixed(4);

			//Clean up final object
			delete this.bracketsOpen;
			delete this.quoteOpen;
			delete this.copyOver;

			return {
				output: this.output,
				memory: this.memory,
				time: time,
				overflow: this.constructor.max <= 0,
				trace: this._trace
			};
		}
	}]);

	return Wat;
})();
