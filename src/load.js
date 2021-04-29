/**
 * Class embodying Load functionality.
 * @memberof Spyral
 * @class
 */
class Load {
	static baseUrl;

	/**
	 * Set the base URL for use with the Load class
	 * @param {string} baseUrl 
	 */
	static setBaseUrl(baseUrl) {
		this.baseUrl = baseUrl;
	}

	/**
	 * Make a call to trombone
	 * @param {Object} config 
	 * @param {Object} params
	 * @returns {JSON}
	 */
	static trombone(config = {}, params) {
		let url = new URL(config.trombone ? config.trombone : this.baseUrl + 'trombone', window.location.origin);
		delete config.trombone;
		
		let all = { ...config, ...params };
		for (let key in all) {
			if (all[key] === undefined) { delete all[key]; }
		}
		let searchParams = Object.keys(all).map((key) => {
			if (all[key] instanceof Array) {
				return all[key].map((val) => {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val);
				}).join('&');
			} else {
				return encodeURIComponent(key) + '=' + encodeURIComponent(all[key]);
			}
		}).join('&');
		
		if ('method' in all === false) {
			all.method = 'GET';
		}

		let opt = {};
		if (all.method === 'GET') {
			if (searchParams.length < 800) {
				for (let key in all) {
					if (all[key] instanceof Array) {
						all[key].forEach((val) => {
							url.searchParams.append(key, val);	
						});
					} else {
						url.searchParams.set(key, all[key]);
					}
				}
			} else {
				opt = {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
					body: searchParams
				};
			}
		} else if (all.method === 'POST') {
			opt = {
				method: 'POST'
			};
			if ('body' in all) {
				opt.body = all['body'];
			} else {
				opt.headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
				opt.body = searchParams;
			}
		} else {
			console.warn('Load.trombone: unsupported method:', all.method);
		}
		
		return fetch(url.toString(), opt).then(response => {
			if (response.ok) {
				return response.json();
			}
			else {
				return response.text().then(text => {
					alert(text.split(/(\r\n|\r|\n)/).shift());
					if (window.console) { console.error(text); }
					throw Error(text);
				});
			}
		});
	}

	/**
	 * Fetch content from a URL, often resolving cross-domain data constraints
	 * @param {string} urlToFetch 
	 * @param {Object} config
	 * @returns {Response}
	 */
	static load(urlToFetch, config) {
		let url = new URL(config && config.trombone ? config.trombone : this.baseUrl + 'trombone');
		url.searchParams.set('fetchData', urlToFetch);
		return fetch(url.toString()).then(response => {
			if (response.ok) {
				return response;
			}
			else {
				return response.text().then(text => {
					alert(text.split(/(\r\n|\r|\n)/).shift());
					if (window.console) { console.error(text); }
					throw Error(text);
				});
			}
		}).catch(err => { throw err; });
	}

	/**
	 * Fetch HTML content from a URL
	 * @param {string} url 
	 * @returns {Document}
	 */
	static html(url) {
		return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/html'));
	}

	/**
	 * Fetch XML content from a URL
	 * @param {string} url 
	 * @returns {XMLDocument}
	 */
	static xml(url) {
		return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/xml'));
	}

	/**
	 * Fetch JSON content from a URL
	 * @param {string} url 
	 * @returns {JSON}
	 */
	static json(url) {
		return this.load(url).then(response => response.json());
	}

	/**
	 * Fetch text content from a URL
	 * @param {string} url 
	 * @returns {string}
	 */
	static text(url) {
		return this.load(url).then(response => response.text());
	}
}

export default Load;
