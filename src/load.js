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
	 * @static
	 */
	static setBaseUrl(baseUrl) {
		this.baseUrl = baseUrl;
	}

	/**
	 * Make a call to trombone
	 * @param {Object} config 
	 * @param {Object} params
	 * @returns {JSON}
	 * @static
	 */
	static trombone(config = {}, params) {
		let url = new URL(config.trombone ? config.trombone : this.baseUrl + 'trombone', window.location.origin);
		delete config.trombone;
		
		let all = { ...config, ...params };
		for (let key in all) {
			if (all[key] === undefined) { delete all[key]; }
		}
		
		let method = all.method;
		if (method === undefined) {
			method = 'GET';
		} else {
			delete all.method;
		}

		let opt = {};
		if (method === 'GET' || method === 'POST') {
			if (method === 'POST' || JSON.stringify(all).length > 1000) {
				opt = {
					method: 'POST'
				};
				if ('body' in all) {
					// TODO assume FormData or set this header to ensure UTF-8?
					// opt.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
					opt.body = all['body'];
				} else {
					// don't set header as it messes up boundaries
					const formData = new FormData();
					for (let key in all) {
						if (all[key] instanceof Array) {
							all[key].forEach((val) => {
								formData.append(key, val);	
							});
						} else {
							formData.set(key, all[key]);
						}
					}
					opt.body = formData;
				}
			} else {
				for (let key in all) {
					if (all[key] instanceof Array) {
						all[key].forEach((val) => {
							url.searchParams.append(key, val);	
						});
					} else {
						url.searchParams.set(key, all[key]);
					}
				}
			}
		} else {
			throw Error('Load.trombone: unsupported method:', method);
		}
		
		return fetch(url.toString(), opt).then(response => {
			if (response.ok) {
				return response.json();
			}
			else {
				return response.text().then(text => {
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
	 * @static
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
	 * @static
	 */
	static html(url) {
		return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/html'));
	}

	/**
	 * Fetch XML content from a URL
	 * @param {string} url 
	 * @returns {XMLDocument}
	 * @static
	 */
	static xml(url) {
		return this.text(url).then(text => new DOMParser().parseFromString(text, 'text/xml'));
	}

	/**
	 * Fetch JSON content from a URL
	 * @param {string} url 
	 * @returns {JSON}
	 * @static
	 */
	static json(url) {
		return this.load(url).then(response => response.json());
	}

	/**
	 * Fetch text content from a URL
	 * @param {string} url 
	 * @returns {string}
	 * @static
	 */
	static text(url) {
		return this.load(url).then(response => response.text());
	}
}

export default Load;
