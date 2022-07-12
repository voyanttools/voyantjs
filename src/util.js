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


	/**
	 * Take a data URL and convert it to a Blob.
	 * @param {String} dataUrl 
	 * @returns {Blob}
	 */
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

	/**
	 * Take a Blob and convert it to a data URL.
	 * @param {Blob} blob 
	 * @returns {String}
	 */
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

	/**
	 * Takes an XML document and XSL stylesheet and returns the resulting transformation.
	 * @param {(Document|String)} xmlDoc The XML document to transform
	 * @param {(Document|String)} xslStylesheet The XSL to use for the transformation
	 * @param {Boolean} [returnDoc=false] True to return a Document, false to return a DocumentFragment
	 * @returns {Document}
	 */
	static transformXml(xmlDoc, xslStylesheet, returnDoc=false) {
		if (this.isString(xmlDoc)) {
			const parser = new DOMParser();
			xmlDoc = parser.parseFromString(xmlDoc, 'application/xml');
			const error = this._getParserError(xmlDoc);
			if (error) {
				throw error;
			}
		}
		if (this.isString(xslStylesheet)) {
			const parser = new DOMParser();
			xslStylesheet = parser.parseFromString(xslStylesheet, 'application/xml');
			const error = this._getParserError(xslStylesheet);
			if (error) {
				throw error;
			}
		}
		const xslRoot = xslStylesheet.firstElementChild;
		if (xslRoot.hasAttribute('version') === false) {
			// Transform fails in Firefox if version is missing, so return a more helpful error message instead of the default.
			throw new Error('XSL stylesheet is missing version attribute.');
		}

		const xsltProcessor = new XSLTProcessor();
		try {
			xsltProcessor.importStylesheet(xslStylesheet);
		} catch (e) {
			console.warn(e);
		}
		let result;
		if (returnDoc) {
			result = xsltProcessor.transformToDocument(xmlDoc);
		} else {
			result = xsltProcessor.transformToFragment(xmlDoc, document);
		}
		return result;
	}

	/**
	 * Checks the Document for a parser error and returns an Error if found, or null.
	 * @param {Document} doc 
	 * @param {Boolean} [includePosition=false] True to include the error position information
	 * @returns {Error|null}
	 */
	static _getParserError(doc, includePosition=false) {
		// fairly naive check for parsererror, consider something like https://stackoverflow.com/a/55756548
		const parsererror = doc.querySelector('parsererror');
		if (parsererror !== null) {
			const errorMsg = parsererror.textContent;
			const error = new Error(errorMsg);
			if (includePosition) {
				const lineNumber = parseInt(errorMsg.match(/line[\s\w]+?(\d+)/i)[1]);
				const columnNumber = parseInt(errorMsg.match(/column[\s\w]+?(\d+)/i)[1]);
				error.lineNumber = lineNumber;
				error.columnNumber = columnNumber;
			}
			return error;
		} else {
			return null;
		}
	}

	/**
	 * Returns true if the value is a String.
	 * @param {*} val 
	 * @returns {Boolean} 
	 */
	static isString(val) {
		return typeof val === 'string';
	}

	/**
	 * Returns true if the value is a Number.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isNumber(val) {
		return typeof val === 'number';
	}

	/**
	 * Returns true if the value is a Boolean.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isBoolean(val) {
		return typeof val === 'boolean';
	}

	/**
	 * Returns true if the value is Undefined.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isUndefined(val) {
		return typeof val === 'undefined';
	}

	/**
	 * Returns true if the value is an Array.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isArray(val) {
		return Object.prototype.toString.call(val) === '[object Array]';
	}

	/**
	 * Returns true if the value is an Object.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isObject(val) {
		return Object.prototype.toString.call(val) === '[object Object]';
	}

	/**
	 * Returns true if the value is Null.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isNull(val) {
		return Object.prototype.toString.call(val) === '[object Null]';
	}

	/**
	 * Returns true if the value is a Node.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isNode(val) {
		return val instanceof Node;
	}

	/**
	 * Returns true if the value is a Function.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isFunction(val) {
		return Object.prototype.toString.call(val) === '[object Function]';
	}

	/**
	 * Returns true if the value is a Promise.
	 * @param {*} val 
	 * @returns {Boolean}
	 */
	static isPromise(val) {
		// ES6 promise detection
		// return Object.prototype.toString.call(val) === '[object Promise]';
		
		// general promise detection
		return !!val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
	}

	/**
	 * Takes a MIME type and returns the related file extension.
	 * Only handles file types supported by Voyant.
	 * @param {String} mimeType 
	 * @returns {String}
	 */
	static getFileExtensionFromMimeType(mimeType) {
		mimeType = mimeType.trim().toLowerCase();
		switch (mimeType) {
		case 'application/atom+xml':
			return 'xml';
		case 'application/rss+xml':
			return 'xml';
		case 'application/xml':
			return 'xml';
		case 'application/xhtml+xml':
			return 'xhtml';
		case 'text/html':
			return 'html';
		case 'application/pdf':
			return 'pdf';
		case 'application/vnd.apple.pages':
			return 'pages';
		case 'application/rtf':
			return 'rtf';
		case 'application/vnd.oasis.opendocument.text':
			return 'odt';
		case 'application/epub+zip':
			return 'epub';
		case 'application/msword':
			return 'doc';
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			return 'docx';
		case 'application/vnd.ms-excel':
			return 'xls';
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
			return 'xlsx';
		default:
			return undefined;
		}
	}
}

export default Util;
