class Runner {
	constructor({ editor, output, time, memory, success, trace }) {
		this.editor = editor;
		this.output = output;
		this.time = time;
		this.memory = memory;
		this.success = success;
		this.trace = trace;
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

		worker.postMessage({
			program: this.editor.value,
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