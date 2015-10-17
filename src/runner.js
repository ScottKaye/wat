"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Runner = (function () {
	function Runner(_ref) {
		var editor = _ref.editor;
		var output = _ref.output;
		var time = _ref.time;
		var memory = _ref.memory;
		var success = _ref.success;
		var trace = _ref.trace;

		_classCallCheck(this, Runner);

		this.editor = editor;
		this.output = output;
		this.time = time;
		this.memory = memory;
		this.success = success;
		this.trace = trace;
		this.timer;
	}

	_createClass(Runner, [{
		key: "refresh",
		value: function refresh() {
			var _this = this;

			var worker = new Worker("src/lib/wat.js");

			worker.addEventListener("message", function (msg) {
				clearTimeout(_this.timer);

				var _msg$data = msg.data;
				var output = _msg$data.output;
				var memory = _msg$data.memory;
				var time = _msg$data.time;
				var overflow = _msg$data.overflow;
				var trace = _msg$data.trace;

				//Copy Uint8 values into dynamic memory
				var writableMemory = [];
				memory.forEach(function (m) {
					return writableMemory.push(m);
				});

				_this.output.innerHTML = "<code string>" + output + "</code>";
				_this.memory.innerHTML = writableMemory.map(function (m) {
					return "<code number>" + m + "</code>";
				}).join(" ");
				_this.trace.innerHTML = trace.map(function (t) {
					return "<li class=\"" + (t.link ? 'loop' : '') + "\"><code string>" + t.b + "</code> <code number>" + t.i + "</code></li>";
				}).join("");
				_this.time.innerHTML = "Executed in " + time + " milliseconds.";
				_this.success.className = overflow ? "overflow" : "";

				console.log(output, memory, time, overflow, trace);
			}, false);

			worker.postMessage({
				program: this.editor.value,
				options: {
					trace: true
				}
			});

			this.timer = setTimeout(function () {
				worker.terminate();
				_this.success.className = "terminated";
				console.warn("Terminated after 1 second.");
			}, 1000);
		}
	}]);

	return Runner;
})();
