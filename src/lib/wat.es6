self.importScripts("browser-polyfill.min.js");

self.addEventListener("message", function(msg) {
	const wat = new Wat(msg.data.program, msg.data.options);
	self.postMessage(wat.run());
}, false);

class Wat {
	constructor(str, { stepThrough = false, trace = false } = {}) {
		this.constructor.max = 3000;
		this.constructor.validChars = [...String.raw`+-><.,[](){}/!'"?`];
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

		let openBrackets = 0;
		let brackets = [];

		//Splits raw program into groups that are not inside quotes (literals), then splits each match into character arrays
		let bytes = str.match(/(^|")([^"]*)(?:$|")/g)
			.map(m => m.split(""))
			.reduce((a, b) => a.concat(b));

		/*
		b: byte/decimal number
		i: index
		c: command (b, i + optional location to matching bracket `link`)
		*/

		//Creates parsed program containing only commands that do things
		//Each command is stored with its value and its index in the raw program
		//Loop brackets are matched, and their links are stored on their command object
		this.program = bytes
			.map((b, i) => ({b, i}))
			.filter(c => this.constructor.validChars.indexOf(c.b) >= 0)
			.map((c, i, a) => {
				let m = null;

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
	*commands () {
		let command = this.program[this.ip++];
		if (command) yield command;
		return;
	}
	//Move data pointer right, or wrap
	right () {
		let prev = this.memory[this.dp];
		if (++this.dp > this.memory.length - 1) this.dp = 0;
		if (this.copyOver) {
			this.memory[this.dp] = prev;
		}
	}
	//Move data pointer left, or wrap
	left () {
		let prev = this.memory[this.dp];
		if (--this.dp < 0) this.dp = this.memory.length - 1;
		if (this.copyOver) {
			this.memory[this.dp] = prev;
		}
	}
	//Increment cell at data pointer
	inc () {
		this.memory[this.dp] = (this.memory[this.dp] || 0) + 1;
	}
	//Decrement cell at data pointer
	dec () {
		this.memory[this.dp] = (this.memory[this.dp] || 0) - 1;
	}
	//Add cell at data pointer to output
	print () {
		this.output += String.fromCharCode(this.memory[this.dp]);
	}
	//Add all cells to output
	printAll (i) {
		this.memory.forEach(b => {
			this.output += String.fromCharCode(b);
		});
	}
	//Prompt for user input
	get () {
		let input = prompt('Input');
		if (input === null) this.constructor.max = 0;
		else this.memory[this.dp] = input;
	}
	//Jumps to close brace if current cell is 0
	openLoop () {
		if (this.memory[this.dp] === 0) {
			//Move ahead to matching ]
			let searchCommand = this.program[this.ip - 1];
			this.ip = searchCommand.link;
		}
	}
	//Jumps to open brace if current cell is not 0 
	closeLoop () {
		if (this.memory[this.dp] !== 0) {
			//Move back to matching [
			let searchCommand = this.program[this.ip - 1];
			this.ip = searchCommand.link;
		}
	}
	//Stores the result of adding all cells to the current cell
	add () {
		this.memory[this.dp] = this.memory.reduce((p, c) => p + c);
	}
	//Stores the result of subtracting all cells to the current cell
	sub () {
		this.memory[this.dp] = this.memory.reduce((p, c) => p - c);
	}
	//Stores the result of multiplying all non-zero cells to the current cell
	mult () {
		let total = 1;
		this.memory.filter(b => b).forEach(b => total *= b);
		this.memory[this.dp] = total;
	}
	//Stores the result of divigind all non-zero cells to the current cell
	div () {
		this.memory[this.dp] = this.memory.filter(b => b).reduce((p, c) => p / c);
	}
	//Moves the current cell value to cell 0, moves the data pointer to 0, clear all cells except 0
	//If the data pointer is already at 0, clear all cells
	reset () {
		this.memory[0] = this.memory[this.dp];
		this.memory.fill(0, 1 - +(!this.dp));
		this.dp = 0;
	}
	//Toggles a flag deciding whether or not to copy values when moving the data pointer
	toggleCopyOver () {
		this.copyOver = !this.copyOver;
	}
	//Inserts the character immediately preceding this command to the current cell
	//If that character is a number, insert it directly, otherwise insert its ASCII codee
	read (i) {
		let value = this.raw[i - 1];

		//If the value given is an number, don't convert it to a char code
		if (isNaN(value) || value.charCodeAt(0) === 32) {
			value = value.charCodeAt(0);
		} else {
			//Attempt to find all parts of the number, in case it is multiple digits long
			let nums = [];
			let current = this.raw[--i].trim();
			while (!isNaN(current) && current.length > 0 && --this.constructor.max) {
				nums.push(current);
				current = this.raw[--i].trim();
			}
			value = +nums.reverse().join("");
		}

		this.memory[this.dp] = value;
	}
	//Similar to read, except this reads every character until a closing " is found
	//Each insertion (every character) increments the data pointer
	readStream (i) {
		this.quoteOpen = !this.quoteOpen;

		//If this is the start quote
		if (this.quoteOpen) {
			//Read everything until the next " into respective cells, starting at dp
			let first = i + 1;
			let sub = this.raw.slice(first, this.raw.indexOf(`"`, first));
			--this.dp;

			//Inserts every character as an ASCII code
			//Numbers will be converted to strings (30 => [51, 48])
			sub.match(/(.+?)/gi).forEach(b => {
				b = b.charCodeAt(0);
				this.memory[++this.dp] = b;
			});
		}
	}
	run () {
		let command = this.commands().next();

		const start = performance.now();

		while (!command.done && --this.constructor.max) {
			if (this.trace) {
				this._trace.push(command.value);
			}

			//Execute command from mapping, if the mapping exists
			let fn = this.constructor.mapping[command.value.b];
			if (fn) {
				fn.call(this, command.value.i);
			}

			command = this.commands().next();
		}

		const end = performance.now();
		const time = (end - start).toFixed(4);

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
}