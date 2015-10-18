class Url {
	constructor () {
		this.constructor.params = Url.getParams();
		this.constructor.hash = Url.getHash();
	}
	static buildParams (obj) {
		if (!obj) return "";
		return Object.keys(obj).length ?
			"?" + Object.keys(obj).map(e =>
				[encodeURIComponent(e), encodeURIComponent(obj[e])].join("=")
			).join("&") : "";
	}
	static buildHash (obj) {
		return Object.keys(obj).length ? "#" + btoa(JSON.stringify(obj)) : "";
	}
	static update () {
		let end = Url.buildParams(this.constructor.params) + Url.buildHash(this.constructor.hash);
		history.replaceState(null, document.title, window.location.pathname + end);
	}
	static getParam (param) {
		return this.constructor.params[param];
	}
	static getParams () {
		let query = window.location.search.slice(1);
		if (query.length === 0) return [];
		query.split("&").forEach(q => {
			let s = q.split("=");
			this.constructor.params[decodeURIComponent(s[0])] = decodeURIComponent(s[1].replace(/\+/g, " "));
		});
		return this.constructor.params;
	}
	static removeParam (param) {
		delete this.constructor.params[param];
		Url.update();
	}
	static removeAllParams () {
		this.constructor.params = {};
		Url.update();
	}
	static setParam (param, val) {
		this.constructor.params = Url.getParams();

		if (typeof val === "object")
			val = JSON.stringify(val);

		this.constructor.params[param] = val;
		Url.update();
	}
	static getHash () {
		let hash = window.location.hash.slice(1);
		try { return JSON.parse(atob(hash)) } catch (e) {};
		return hash.length ? { default: hash } : {};
	}
	static getHashParam (param) {
		return Url.getHash()[param];
	}
	static setHashParam (param, val) {
		this.constructor.hash = Url.getHash();
		this.constructor.hash[param] = val;
		Url.update();
	}
	static removeHashParam (param) {
		delete this.constructor.hash[param]
		Url.update();
	}
	static removeHash () {
		this.constructor.hash = {};
		Url.update();
	}
}