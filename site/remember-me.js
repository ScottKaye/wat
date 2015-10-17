"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Remembered = (function () {
	function Remembered(_ref) {
		var id = _ref.id;
		var value = _ref.value;
		var type = _ref.type;
		var _ref$seq = _ref.seq;
		var seq = _ref$seq === undefined ? this.constructor.gSeq || 0 : _ref$seq;

		_classCallCheck(this, Remembered);

		this.constructor.gSeq = 0;
		this.constructor.localKey = this.constructor.localKey || {};

		this.id = id;
		this.value = value;
		this.type = type;
		this.seq = seq;
	}

	_createClass(Remembered, [{
		key: "remember",
		value: function remember() {
			this.constructor.localKey["r" + this.id] = this;
			localStorage.rem = JSON.stringify(this.constructor.localKey);
			this.constructor.gSeq = this.seq + 1;
		}
	}, {
		key: "restore",
		value: function restore(node) {
			var _this = this;

			var els = document.querySelectorAll("[remember-me=" + this.id + "]");
			switch (this.type) {
				case "checkbox":
					[].concat(_toConsumableArray(els)).forEach(function (el) {
						return el.checked = _this.value;
					});
					break;
				case "radio":
					[].concat(_toConsumableArray(els)).forEach(function (el) {
						return el.checked = _this.value;
					});
					break;
				default:
					[].concat(_toConsumableArray(els)).forEach(function (el) {
						if (!node || !node.isSameNode(el)) {
							el.value = _this.value;
						}
					});
			}
		}
	}], [{
		key: "evt",
		value: function evt(value) {
			var id = this.getAttribute("remember-me");
			var type = this.type;
			var rem = new Remembered({ id: id, value: value, type: type });
			rem.remember();
			rem.restore(this);
		}
	}]);

	return Remembered;
})();

[].concat(_toConsumableArray(document.querySelectorAll("[remember-me]:not([type=password])"))).forEach(function (remember) {
	var id = remember.getAttribute("remember-me");
	if (!id) return;

	switch (remember.type) {
		case "checkbox":
		case "radio":
			remember.addEventListener("change", function () {
				Remembered.evt.bind(this)(this.checked);
			});
			break;
		default:
			remember.addEventListener("input", function () {
				Remembered.evt.bind(this)(this.value);
			});
	}
});

(function () {
	if (document.readyState !== "loading") recall();else document.addEventListener("DOMContentLoaded", recall);

	function recall() {
		if (!localStorage.rem) return;
		try {
			(function () {
				var raw = JSON.parse(localStorage.rem);
				var rems = [];

				Object.keys(raw).forEach(function (key) {
					return rems.push(raw[key]);
				});

				Object.keys(rems.sort(function (a, b) {
					return +(a.seq > b.seq) * 2 - 1;
				})).forEach(function (key) {
					var obj = rems[key];
					var rem = new Remembered({
						id: obj.id,
						value: obj.value,
						type: obj.type,
						seq: obj.seq
					});
					rem.restore();
					rem.remember();
				});
			})();
		} catch (ex) {
			console.error("Invalid JSON in localStorage.rem, full trace below:");
			console.error(ex);
		}
	}
})();
