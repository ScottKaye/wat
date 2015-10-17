class WatStatic {
	static getRawCommands (str) {
		return str.match(/(^|")([^"]*)(?:$|")/g)
			.map(m => m.split(""))
			.reduce((a, b) => a.concat(b));
	}
}