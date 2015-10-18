"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Url = (function () {
	function Url() {
		_classCallCheck(this, Url);

		this.constructor.params = Url.getParams();
		this.constructor.hash = Url.getHash();
	}

	_createClass(Url, null, [{
		key: "buildParams",
		value: function buildParams(obj) {
			if (!obj) return "";
			return Object.keys(obj).length ? "?" + Object.keys(obj).map(function (e) {
				return [encodeURIComponent(e), encodeURIComponent(obj[e])].join("=");
			}).join("&") : "";
		}
	}, {
		key: "buildHash",
		value: function buildHash(obj) {
			return Object.keys(obj).length ? "#" + btoa(JSON.stringify(obj)) : "";
		}
	}, {
		key: "update",
		value: function update() {
			var end = Url.buildParams(this.constructor.params) + Url.buildHash(this.constructor.hash);
			history.replaceState(null, document.title, window.location.pathname + end);
		}
	}, {
		key: "getParam",
		value: function getParam(param) {
			return this.constructor.params[param];
		}
	}, {
		key: "getParams",
		value: function getParams() {
			var _this = this;

			var query = window.location.search.slice(1);
			if (query.length === 0) return [];
			query.split("&").forEach(function (q) {
				var s = q.split("=");
				_this.constructor.params[decodeURIComponent(s[0])] = decodeURIComponent(s[1].replace(/\+/g, " "));
			});
			return this.constructor.params;
		}
	}, {
		key: "removeParam",
		value: function removeParam(param) {
			delete this.constructor.params[param];
			Url.update();
		}
	}, {
		key: "removeAllParams",
		value: function removeAllParams() {
			this.constructor.params = {};
			Url.update();
		}
	}, {
		key: "setParam",
		value: function setParam(param, val) {
			this.constructor.params = Url.getParams();

			if (typeof val === "object") val = JSON.stringify(val);

			this.constructor.params[param] = val;
			Url.update();
		}
	}, {
		key: "getHash",
		value: function getHash() {
			var hash = window.location.hash.slice(1);
			try {
				return JSON.parse(atob(hash));
			} catch (e) {};
			return hash.length ? { "default": hash } : {};
		}
	}, {
		key: "getHashParam",
		value: function getHashParam(param) {
			return Url.getHash()[param];
		}
	}, {
		key: "setHashParam",
		value: function setHashParam(param, val) {
			this.constructor.hash = Url.getHash();
			this.constructor.hash[param] = val;
			Url.update();
		}
	}, {
		key: "removeHashParam",
		value: function removeHashParam(param) {
			delete this.constructor.hash[param];
			Url.update();
		}
	}, {
		key: "removeHash",
		value: function removeHash() {
			this.constructor.hash = {};
			Url.update();
		}
	}]);

	return Url;
})();
