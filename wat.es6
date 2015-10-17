class Wat {
	constructor(str, { stepThrough = false, trace = false } = {}) {
		this.constructor.max = 3000;
		this.constructor.validChars = [...String.raw`+-><.,[])}({/\'"?~`];
		this.memory = new Uint8Array(+str.match(/\d+/) || 5);
		this.dp = 0;
		this.ip = 0;
		this.raw = str;

		this.stepThrough = stepThrough;
		this.trace = trace;

		let openBrackets = 0;
		let brackets = [];

		/*
		b: byte/decimal number
		i: index
		c: command (b, i + optional location to matching bracket `link`)
		*/
		this.program = str.split("")
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
	*commands () {
		let command = this.program[this.ip++];
		if (command) yield command;
		return;
	}
	run () {
		let { memory, dp, raw, trace } = this;
		let output = "",
			copyOver = true,
			quoteOpen = false,
			bracketsOpen = 0;
		let max = this.constructor.max;
		let command = this.commands().next();

		let start = performance.now();

		while (!command.done && --max) {
			let prev;

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
					if (input === null) max = 0;
					else memory[dp] = input;
					break;
				case '[':
					if (memory[dp] === 0) {
						let searchCommand = this.program[this.ip - 1];
						this.ip = searchCommand.link;
					}
					break;
				case ']':
					if (memory[dp] !== 0) {
						//Move back to matching [
						let searchCommand = this.program[this.ip - 1];
						this.ip = searchCommand.link;
					}
					break;
				//Add
				case ')':
					memory[dp] = memory.reduce((p, c) => p + c);
					break;
				//Multiply
				case '(':
					let total = 1;
					memory.filter(b => b).forEach(b => total *= b);
					memory[dp] = total;
					break;
				//Subtract
				case '}':
					memory[dp] = memory.reduce((p, c) => p - c);
					break;
				//Divide
				case '{':
					memory[dp] = memory.filter(b => b).reduce((p, c) => p / c);
					break;
				//Move & clear
				case '/':
					memory[0] = memory[dp];
					memory.fill(0, 1 - +(!dp));
					dp = 0;
					break;
				//Add all to output as ASCII
				case '\\':
					memory.forEach(b => output += String.fromCharCode(b));
					break;
				//Toggle copyOver
				case `'`:
					copyOver = !copyOver;
					break;
				//Get single input
				case '?':
					let value = raw[command.value.i - 1];

					//If the value given is an number, don't conver it to a char code
					if (isNaN(value)) {
						value = value.charCodeAt(0);
					}

					memory[dp] = value;
					break;
				//Get stream of input
				case `"`:
					quoteOpen = !quoteOpen;
					//If this is the start quote
					if (quoteOpen) {
						//Read everything until the next " into respective cells, starting at dp
						let first = command.value.i + 1;
						let sub = raw.slice(first, raw.indexOf(`"`, first));
						--dp;

						//Numbers over 2 digits long will be inserted directly (as numbers)
						//Everything else gets converted to its ASCII code
						sub.split(/[^0-9]/g).forEach(b => {
							if (isNaN(b)) b = b.charCodeAt(0);
							memory[++dp] = b;
						});
					}
					break;
			}

			command = this.commands().next();
		}

		let end = performance.now();
		let time = (end - start).toFixed(4);

		if (max <= 0) console.error("Overflowed!");

		console.log("Memory\t\t", memory);
		console.log("Output\t\t", output);
		console.log("Time (ms)\t", time);

		//Clean up final object
		delete this.bracketsOpen;
		delete this.quoteOpen;
		delete this.copyOver;

		this.dp = dp;
	};
}


let wat = new Wat(String.raw`
 	30'>++++++++[-<+++++++++>]<.>>+>-[+]++>++>+++[>[->+++<<+++>]<<]>-----.>->
+++..+++.>-.<<+[>[+>+]>>]<--------------.>>.+++.------.--------.>+.>+.
`, {
	stepThrough: true,
	trace: false
});

let wat2 = new Wat('++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.');

wat.run();
console.log(wat);