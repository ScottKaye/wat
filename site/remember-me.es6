class Remembered {
	constructor ({id, value, type, seq = this.constructor.gSeq || 0}) {
		this.constructor.gSeq = 0;
		this.constructor.localKey = this.constructor.localKey || {};

		this.id = id;
		this.value = value;
		this.type = type;
		this.seq = seq;
	}
	remember () {
		this.constructor.localKey["r" + this.id] = this;
		localStorage.rem = JSON.stringify(this.constructor.localKey);
		this.constructor.gSeq = this.seq + 1;
	}
	restore (node) {
		let els = document.querySelectorAll(`[remember-me=${this.id}]`);
		switch (this.type) {
			case "checkbox":
				[...els].forEach(el => el.checked = this.value);
				break;
			case "radio":
				[...els].forEach(el => el.checked = this.value);
				break;
			default:
				[...els].forEach(el => {
					if (!node || !node.isSameNode(el)) {
						el.value = this.value;
					}
				});	
		}
	}
	static evt (value) {
		let id = this.getAttribute("remember-me");
		let type = this.type;
		let rem = new Remembered({id, value, type});
		rem.remember();
		rem.restore(this);
	}
}

[...document.querySelectorAll("[remember-me]:not([type=password])")]
	.forEach(remember => {
		let id = remember.getAttribute("remember-me");
		if (!id) return;

		switch (remember.type) {
			case "checkbox":
			case "radio":
				remember.addEventListener("change", function() {
					Remembered.evt.bind(this)(this.checked);
				});
				break;
			default:
				remember.addEventListener("input", function() {
					Remembered.evt.bind(this)(this.value);
				});
		}
	});

() => {
	if (document.readyState !== "loading") recall();
	else document.addEventListener("DOMContentLoaded", recall);

	function recall() {
		if (!localStorage.rem) return;
		try {
			const raw = JSON.parse(localStorage.rem);
			let rems = [];

			Object.keys(raw).forEach(key => rems.push(raw[key]));

			Object.keys(rems
				.sort((a, b) => +(a.seq > b.seq) * 2 - 1))
				.forEach(key => {
					let obj = rems[key];
					let rem = new Remembered({
                    	id: obj.id,
                    	value: obj.value,
                    	type: obj.type,
                    	seq: obj.seq
                    });
					rem.restore();
					rem.remember();
			});
		} catch (ex) {
			console.error("Invalid JSON in localStorage.rem, full trace below:");
			console.error(ex);
		}
	}
}();