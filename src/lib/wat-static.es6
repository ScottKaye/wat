//For use in a web worker with importScripts
//Or for using the runner without including the polyfill on the page (generator requires giant polyfill)

class WatStatic {
	static getRawCommands (str) {
		return str.match(/(^|")([^"]*)(?:$|")/g)
			.map(m => m.split(""))
			.reduce((a, b) => a.concat(b));
	}
}