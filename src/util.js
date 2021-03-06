/**
 * A helper for working with the Voyant Notebook app.
 * @memberof Spyral
 */
class Util {

	/**
	 * Generates a random ID of the specified length.
	 * @param {Number} len The length of the ID to generate?
	 * @returns {String}
	 */
	static id(len = 8) {
		// based on https://stackoverflow.com/a/13403498
		const times = Math.ceil(len / 11);
		let id = '';
		for (let i = 0; i < times; i++) {
			id += Math.random().toString(36).substring(2); // the result of this is 11 characters long
		}
		const letters = 'abcdefghijklmnopqrstuvwxyz';
		id = letters[Math.floor(Math.random()*26)] + id; // ensure the id starts with a letter
		return id.substring(0, len);
	}

	/**
	 * 
	 * @param {Array|Object|String} contents 
	 * @returns {String}
	 */
	static toString(contents) {
		if (contents.constructor === Array || contents.constructor===Object) {
			contents = JSON.stringify(contents);
			if (contents.length>500) {
				contents = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+contents.substring(0,500)+' <a href="">+</a><div style="display: none">'+contents.substring(501)+'</div>';
			}
		}
		return contents.toString();
	}

	/**
	 * 
	 * @param {String} before 
	 * @param {String} more 
	 * @param {String} after 
	 */
	static more(before, more, after) {
		return before + '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'+more.substring(0,500)+' <a href="">+</a><div style="display: none">'+more.substring(501)+'</div>' + after;
	}


	static dataUrlToBlob(dataUrl) {
		const parts = dataUrl.split(',');
		const byteString = atob(parts[1]);
		const mimeString = parts[0].split(':')[1].split(';')[0];
		
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		
		return new Blob([ab], {type: mimeString});
	}

	static blobToDataUrl(blob) {
		return new Promise((resolve, reject) => {
			const fr = new FileReader();
			fr.onload = function(e) {
				resolve(e.target.result);
			};
	
			try {
				fr.readAsDataURL(blob);
			} catch(e) {
				reject(e);
			}
		});
	}

	static isString(val) {
		return typeof val === 'string';
	}

	static isNumber(val) {
		return typeof val === 'number';
	}

	static isBoolean(val) {
		return typeof val === 'boolean';
	}

	static isUndefined(val) {
		return typeof val === 'undefined';
	}

	static isArray(val) {
		return Object.prototype.toString.call(val) === '[object Array]';
	}

	static isObject(val) {
		return Object.prototype.toString.call(val) === '[object Object]';
	}

	static isNull(val) {
		return Object.prototype.toString.call(val) === '[object Null]';
	}

	static isNode(val) {
		return val instanceof Node;
	}
}

export default Util;
