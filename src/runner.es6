class Runner {
	constructor({ editor, output, time, memory, success, trace, input }) {
		if (!WatStatic) {
			throw new Error("Wat?  WatStatic wasn't found in the globals.");
		}

		this.editor = editor;
		this.output = output;
		this.time = time;
		this.memory = memory;
		this.success = success;
		this.trace = trace;
		this.input = input;
		this.timer;
	}
	refresh () {
		const worker = new Worker("src/lib/wat.js");

		worker.addEventListener("message", (msg) => {
			clearTimeout(this.timer);

			const { output, memory, time, overflow, trace } = msg.data;

			//Copy Uint8 values into dynamic memory
			let writableMemory = [];
			memory.forEach(m => writableMemory.push(m));

			this.output.innerHTML = `<code string>${output}</code>`;
			this.memory.innerHTML = writableMemory.map(m => {
				return `<code number>${m}</code>`;
			}).join(" ");
			this.trace.innerHTML = trace.map(t => 
				`<li class="${t.link ? 'loop' : ''}"><code string>${t.b}</code> <code number>${t.i}</code></li>`
			).join("");
			this.time.innerHTML = `Executed in ${time} milliseconds.`;
			this.success.className = overflow ? "overflow" : "";

			console.log(output, memory, time, overflow, trace);
		}, false);

		//Substitute prompts with raw input
		//First calculate where substitutions need to be made
		let subs = [];
		let parsedProgram = WatStatic.getRawCommands(this.editor.value);
		this.input.value.split(" ")
			.forEach(i => {
				let idx = parsedProgram.indexOf(',');
				if (idx >= 0) {
					subs.push({idx, val: i[0] || " "});
				}
			});

		//Now substitute, if there are any
		let program = this.editor.value;
		if (subs.length) {
			program = [...program];
			subs.forEach(s => {
				//First insert a space to break up numbers, then the input, then a read character
				program[s.idx] = ' ';
				program.splice(s.idx + 1, 0, s.val);
				program.splice(s.idx + 2, 0, '?');
			});
			program = program.join("");
		}

		worker.postMessage({
			program,
			options: {
				trace: true
			}
		});

		this.timer = setTimeout(() => {
			worker.terminate();
			this.success.className = "terminated";
			console.warn("Terminated after 1 second.");
		}, 1000);
	}
}