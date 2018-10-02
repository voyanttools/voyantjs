//import Chart from "./chart";

// this seems like a good balance between a built-in flexible parser and a heavier external parser
// https://lowrey.me/parsing-a-csv-file-in-es6-javascript/
const regex = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
function parseCsvLine(line) {
	let arr = [];
	line.replace(regex, (m0, m1, m2, m3) => {
		if (m1 !== undefined) {
			arr.push(m1.replace(/\\'/g, "'"));
		} else if (m2 !== undefined) {
			arr.push(m2.replace(/\\"/g, "\""));
		} else if (m3 !== undefined) {
			arr.push(m3);
		}
		return "";
	});
	if (/,\s*$/.test(line)) {arr.push("");}
	return arr;
	
}

export function create(data, config, ...other) {
	return new Table(data, config, ...other);
}

export class Table {

	constructor(data, config, ...other) {

		this._rows = [];
		this._headers = {};
		this._rowKeyColumnIndex = 0;
		
		// we have a configuration object followed by values: create({headers: []}, 1,2,3) …
		if (data && typeof data == "object" && (typeof config == "string" || typeof config == "number" || Array.isArray(config))) {
			data.rows = [config].concat(other);
			config = undefined;
		}
		
		// we have a simple variable set of arguments: create(1,2,3) …
		if (Array.from(arguments).every(a => a!==undefined && !Array.isArray(a) && typeof a != "object")) {
			data = [data,config].concat(other);
			config = undefined;
		}
		
		// first check if we have a string that might be delimited data
		if (data && (typeof data == "string" || typeof data =="number")) {
			if (typeof data == "number") {data = String(data)} // convert to string for split
			let rows = [];
			let format = config && "format" in config ? config.format : undefined;
			data.split(/(\r\n|\r|\n)+/).forEach((line,i) => {
				let values;
				if ((format && format=="tsv") || line.indexOf("\t")>-1) {
					values = line.split(/\t/);
				} else if ((format && format=="csv") || line.indexOf(",")>-1) {
					values = parseCsvLine(line)
				} else {
					values = [line]
				}
				
				// if we can't find any config information for headers then we try to guess
				// if the first line doesn't have any numbers - this heuristic may be questionable
				if (line==0 && values.every(v => isNaN(v)) && 
					((typeof config != "object") || (typeof config == "object" && !("hasHeaders" in config) && !("headers" in config)))) {
					this.setHeaders(values);
				} else {
					rows.push(values.map(v => isNaN(v) ? v : Number(v)))
				}
			})
			data = rows;
		}
		
		if (data && Array.isArray(data)) {
			if (config) {
				if (Array.isArray(config)) {
					this.setHeaders(config);
				} else if (typeof config == "object") {
					if ("headers" in config) {
						this.setHeaders(config.headers)
					} else if ("hasHeaders" in config && config.hasHeaders) {
						this.setHeaders(data.shift())
					}
				}
			}
			if (config && "count" in config && config.count) {
				let freqs = counts(data);
				if (config.count=="vertical") {
					for (let item in freqs) {
						this.addRow(item, freqs[item])
					}
				} else {
					this._headers = []; // reset and use the terms as headers
					this.addRow(freqs)
				}
			} else {
				this.addRows(data);
			}
		} else if (data && typeof data == "object") {
			if ("headers" in data && Array.isArray(data.headers)) {
				this.setHeaders(data.headers);
			} else if ("hasHeaders" in data && "rows" in data) {
				this.setHeaders(data.rows.shift())
			}
			if ("rows" in data && Array.isArray(data.rows)) {
				this.addRows(data.rows)
			}
			if ("rowKeyColumn" in data) {
				if (typeof data.rowKeyColumn == "number") {
					if (data.rowKeyColumn < this.columns()) {
						this._rowKeyColumnIndex = data.rowKeyColumn;
					} else {
						throw new Error("The rowKeyColumn value is higher than the number headers designated: "+data.rowKeyColum);
					}
				} else if (typeof data.rowKeyColumn == "string") {
					if (data.rowKeyColumn in this._headers) {
						this._rowKeyColumnIndex = this._headers[data.rowKeyColumn];
					} else {
						throw new Error("Unable to find column designated by rowKeyColumn: "+data.rowKeyColumn);
					}
				}
			}
		}
	}
	
	setHeaders(data) {
		if (data && Array.isArray(data)) {
			data.forEach(h => this.addColumn(h), this);
		} else if (typeof data == "object") {
			if (this.columns()==0 || Object.keys(data).length==this.columns()) {
				this._headers = data;
			} else {
				throw new Error("The number of columns don't match: ");
			}
		} else {
			throw new Error("Unrecognized argument for headers, it should be an array or an object."+data)
		}
		return this;
	}
	
	addRows(data) {
		data.forEach(row => this.addRow(row), this);
		return this;
	}
	
	addRow(data, ...other) {
		
		// we have multiple arguments, so call again as an array
		if (other.length>0) {
			return this.addRow([data].concat(other))
		}

		this.setRow(this.rows(), data, true);
		return this;
	}
	
	setRow(ind, data, create) {

		let rowIndex = this.getRowIndex(ind, create);
		if (rowIndex>=this.rows() && !create) {
			throw new Error("Attempt to set row values for a row that does note exist: "+ind+". Maybe use addRow() instead?");
		}
		
		// we have a simple array, so we'll just push to the rows
		if (data && Array.isArray(data)) {
			if (data.length>this.columns()) {
				if (create) {
					for (let i = this.columns(); i<data.length; i++) {
						this.addColumn();
					}
				} else {
					throw new Error("The row that you've created contains more columns than the current table. Maybe use addColunm() first?")
				}
			}
			data.forEach((d,i) => this.setCell(rowIndex, i, d), this);
		}
		
		// we have an object so we'll use the headers
		else if (typeof data == "object") {
			for (let column in data) {
				if (!this.hasColumn(column)) {
				}
				this.setCell(rowIndex, column, data[column]);
			}
		}
		
		else if (this.columns()<2 && create) { // hopefully some scalar value
			if (this.columns()==0) {
				this.addColumn(); // create first column if it doesn't exist
			}
			this.setCell(rowIndex,0,data);
		} else {
			throw new Error("setRow() expects an array or an object, maybe setCell()?")
		}
		
		return this;

	}
	
	setColumn(ind, data, create) {

		let columnIndex = this.getColumnIndex(ind, create);
		if (columnIndex>=this.columns() && !create) {
			throw new Error("Attempt to set column values for a column that does note exist: "+ind+". Maybe use addColumn() instead?");
		}
		
		// we have a simple array, so we'll just push to the rows
		if (data && Array.isArray(data)) {
			data.forEach((d,i) => this.setCell(i, columnIndex, d, create), this);
		}
		
		// we have an object so we'll use the headers
		else if (typeof data == "object") {
			for (let row in data) {
				this.setCell(row, columnIndex, data[column], create);
			}
		}
		
		// hope we have a scalar value to assign to the first row
		else {
			this.setCell(0,columnIndex,data, create);
		}
		
		return this;

	}

	
	
	updateCell(row, column, value, overwrite) {
		let rowIndex = this.getRowIndex(row, true);
		let columnIndex = this.getColumnIndex(column, true);
		let val = this.cell(rowIndex, columnIndex);
		this._rows[rowIndex][columnIndex] = val && !overwrite ? val+value : value;
		return this;
	}
	
	cell(rowInd, colInd) {
		return this._rows[this.getRowIndex(rowInd)][this.getColumnIndex(colInd)];
	}

	setCell(row, column, value) {
		this.updateCell(row,column,value,true);
		return this;
	}
		
	getRowIndex(ind, create) {
		if (typeof ind == "number") {
			if (ind < this._rows.length) {
				return ind;
			} else if (create) {
				this._rows[ind] = Array(this.columns());
				return ind;
			}
			throw new Error("The requested row does not exist: "+ind)
		} else if (typeof ind == "string") {
			let row = this._rows.findIndex(r => r[this._rowKeyColumnIndex] === ind, this);
			if (row>-1) {return row;}
			else if (create) {
				let arr = Array(this.columns());
				arr[this._rowKeyColumnIndex] = ind;
				this.addRow(arr);
				return this.rows();
			}
			else {
				throw new Error("Unable to find the row named "+ind);
			}
		}
		throw new Error("Please provide a valid row (number or named row)");
	}
	
	getColumnIndex(ind, create) {
		if (typeof ind == "number") {
			if (ind < this.columns()) {
				return ind;
			} else if (create) {
				this.addColumn(ind)
				return ind;
			}
			throw new Error("The requested column does not exist: "+ind)
		} else if (typeof ind == "string") {
			if (ind in this._headers) {
				return this._headers[ind];
			} else if (create) {
				this.addColumn({header: ind});
				return this._headers[ind];
			}
			throw new Error("Unable to find column named "+ind);
		}
		throw new Error("Please provide a valid column (number or named column)");
	}
	
	addColumn(config, ind) {
	
		// determine col
		let col = this.columns(); // default
		if (config && typeof config == "string") {col=config}
		else if (config && (typeof config == "object") && ("header" in config)) {col = config.header}
		else if (ind!==undefined) {col=ind}

		// check if it exists
		if (col in this._headers) {
			throw new Error("This column exists already: "+config.header)
		}
		
		// add column
		let colIndex = this.columns();
		this._headers[col] = colIndex;
		
		// determine data
		let data = [];
		if (config && typeof config == "object" && "rows" in config) {data=config.rows}
		else if (Array.isArray(config)) {data = config;}
		
		// add data to each row
		this._rows.forEach((r,i) => r[colIndex] = data[i])
		return this;
	}
	
	/**
	 * This function returns different values depending on the arguments provided.
	 * When there are no arguments, it returns the number of rows in this table.
	 * When the first argument is the boolean value `true` all rows are returned.
	 * When the first argument is a an array then the rows corresponding to the row
	 * indices or names are returned. When all arguments except are numbers or strings
	 * then each of those is returned. 
	 */
	rows(inds, config, ...other) {
	
		// return length
		if (inds==undefined) {
			return this._rows.length;
		}
		
		let rows = [];
		let asObj = (config && typeof config == "object" && config.asObj) ||
			(other.length>0 && typeof other[other.length-1] == "object" && other[other.length-1].asObj);
		
		// return all
		if (typeof inds == "boolean" && inds) {
			rows = this._rows.map((r,i) => this.row(i, asObj))
		}
		
		// return specified rows
		else if (Array.isArray(inds)) {
			rows = inds.map(ind => this.row(ind));
		}
		
		// return specified rows as varargs
		else if (typeof inds == "number" || typeof inds == "string") {
			[inds, config, ...other].every(i => {
				if (typeof i == "number" || typeof i == "string") {
					rows.push(this.row(i, asObj));
					return true
				} else {
					return false
				}
			})
			if (other.length>0) { // when config is in last position
				if (typeof other[other.length-1] == "object") {
					config = other[other.length-1]
				}
			}
		}
		
		// zip if requested
		if (config && typeof config == "object" && "zip" in config && config.zip) {
			if (rows.length<2) {throw new Error("Only one row available, can't zip")}
			return zip(rows);
		}
		else {
			return rows;
		}
	}
	
	row(ind, asObj) {
		let row = this._rows[this.getRowIndex(ind)];
		if (asObj) {
			let obj = {};
			for (let key in this._headers) {
				obj[key] = row[this._headers[key]]
			}
			return obj;
		} else {
			return row;
		}
	}
	
	/**
	 * This function returns different values depending on the arguments provided.
	 * When there are no arguments, it returns the number of rows in this table.
	 * When the first argument is the boolean value `true` all rows are returned.
	 * When the first argument is a number a slice of the rows is returned and if
	 * the second argument is a number it is treated as the length of the slice to
	 * return (note that it isn't the `end` index like with Array.slice()).
	 */
	columns(inds, config, ...other) {
	
		// return length
		if (inds==undefined) {
			return Object.keys(this._headers).length;
		}
		
		let columns = [];
		let asObj = (config && typeof config == "object" && config.asObj) ||
			(other.length>0 && typeof other[other.length-1] == "object" && other[other.length-1].asObj);
		
		// return all columns
		if (typeof inds == "boolean" && inds) {
			for (let i=0, len=this.columns(); i<len; i++) {
				columns.push(this.column(i, asObj));
			}
		}
		
		// return specified columns
		else if (Array.isArray(inds)) {
			inds.forEach(i => columns.push(this.column(i, asObj)), this);
		}
		
		else if (typeof inds == "number" || typeof inds == "string") {
			[inds, config, ...other].every(i => {
				if (typeof i == "number" || typeof i == "string") {
					columns.push(column(ind, asObj));
					return true
				} else {
					return false
				}
			})
			if (other.length>0) { // when config is in last position
				if (typeof other[other.length-1] == "object") {
					config = other[other.length-1]
				}
			}
		}
		
		if (config && typeof config == "object" && "zip" in config && config.zip) {
			if (columns.length<2) {throw new Error("Only one column available, can't zip")}
			return zip(columns);
		}
		else {
			return columns;
		}
	}
	
	column(ind, asObj) {
		let column = this.getColumnIndex(ind);
		let data = this._rows.forEach(r => r[column]);
		if (asObj) {
			let obj = {};
			this._rows.forEach(r => {
				obj[r[this._rowKeyColumnIndex]] = r[column];
			})
			return obj;
		} else {
			return this._rows.map(r => r[column]);
		}
	}
	
	header(ind) {
		let keys = Object.keys(this._headers);
		let i = this.getColumnIndex(ind);
		return keys[keys.findIndex(k => i==this._headers[k])]
	}
	
	headers(start, length) {
		if (start) {
			let headers = [];
			for (let k in this._headers) {
				headers[this._headers[k]] = k;
			}
			if (typeof start === "boolean" && start) {
				return headers;
			}
			if (typeof start === "number") {
				return headers.slice(start, length && typeof length === "number" ? start+length : undefined);
			}
		}
		return Object.keys(this._headers).length;
	}

	hasColumn(ind) {
		return ind in this._headers;
	}
	
	forEach(fn) {
		this._rows.forEach((r,i) => fn(r,i));
	}
	
	rowMin(ind) {
		return Math.min.apply(null, this.row(ind));
	}
	
	rowMax(ind) {
		return Math.max.apply(null, this.row(ind));
	}
	
	columnMin(ind) {
		return Math.min.apply(null, this.column(ind));
	}
	
	columnMax(ind) {
		return Math.max.apply(null, this.column(ind));
	}
	
	rowSum(ind) {
		return sum(this.row(ind));
	}
	
	columnSum(ind) {
		return sum(this.column(ind));
	}

	rowMean(ind) {
		return mean(this.row(ind));
	}
	
	columnMean(ind) {
		return mean(this.column(ind));
	}
	
	rowRollingMean(ind, neighbors, overwrite) {
		let means = rollingMean(this.row(ind), neighbors);
		if (overwrite) {
			this.setRow(ind, means);
		}
		return means;
	}
	
	columnRollingMean(ind, neighbors, overwrite) {
		let means = rollingMean(this.column(ind), neighbors);
		if (overwrite) {
			this.setColumn(ind, means);
		}
		return means;
	}
	
	rowVariance(ind) {
		return variance(this.row(ind));
	}
	
	columnVariance(ind) {
		return variance(this.column(ind));
	}
	
	rowStandardDeviation(ind) {
		return standardDeviation(this.row(ind));
	}
	
	columnStandardDeviation(ind) {
		return standardDeviation(this.column(ind));
	}
	
	rowZScores(ind) {
		return zScores(this.row(ind));
	}
	
	columnZScores(ind) {
		return zScores(this.column(ind));
	}
	
	rowSort(inds, config) {

		// no inds, use all columns
		if (inds===undefined) {
			inds = Array(this.columns()).fill().map((_,i) => i)
		}

		// wrap a single index as array
		if (typeof inds == "string" || typeof inds == "number") {
			inds = [inds];
		}

		if (Array.isArray(inds)) {
			return this.rowSort((a,b) => {
				let ind;
				for (let i=0, len=inds.length; i<len; i++) {
					ind = this.getColumnIndex(inds[i]);
					if (a!=b) {
						if (typeof a[ind] == "string" && typeof b[ind] == "string") {
							return a[ind].localeCompare(b[ind]);
						} else {
							return a[ind]-b[ind];
						}
					}
				}
				return 0;
			}, config)
		}

		if (typeof inds == "function") {
			this._rows.sort((a,b) => {
				if (config && "asObject" in config && config.asObject) {
					let c = {};
					for (let k in this._headers) {
						c[k] = a[this._headers[k]]
					}
					let d = {};
					for (let k in this._headers) {
						d[k] = b[this._headers[k]]
					}
					return inds(c,d);
				} else {
					return inds(a,b);
				}
			});
			if (config && "reverse" in config && config.reverse) {
				this._rows.reverse(); // in place
			}
		}
		
		return this;
	}
	
	columnSort(inds, config) {
		
		// no inds, use all columns
		if (inds===undefined) {
			inds = Array(this.columns()).fill().map((_,i) => i);
		}

		// wrap a single index as array
		if (typeof inds == "string" || typeof inds == "number") {
			inds = [inds];
		}
		
		if (Array.isArray(inds)) {
			
			// convert to column names
			let headers = inds.map(ind => this.header(ind));
			
			// make sure we have all columns
			Object.keys(this._headers).forEach(h => {
				if (!headers.includes(h)) {headers.push(h)}
			});
			
			// sort names alphabetically
			headers.sort((a,b) => a.localeCompare(b))
			
			// reorder by columns
			this._rows = this._rows.map((_,i) => headers.map(h => this.cell(i,h)));
			this._headers = {};
			headers.forEach((h,i) => this._headers[h]=i)
			
		}
		
		if (typeof inds == "function") {
			let headers = Object.keys(this._headers);
			if (config && "asObject" in headers && headers.asObject) {
				headers = headers.map((h,i) => {
					return {header: h, data: this._rows.map((r,j) => this.cell(i,j))}
				})
			}
			headers.sort((a,b) => {
				return inds(a,b);
			})
			headers = headers.map(h => typeof h == "object" ? h.header : h); // convert back to string
			
			// make sure we have all keys
			Object.keys(this._headers).forEach(k => {
				if (headers.indexOf(k)==-1) {headers.push(k)}
			})
			
			this._rows = this._rows.map((_,i) => headers.map(h => this.cell(i,h)));
			this._headers = {};
			headers.forEach((h,i) => this._headers[h]=i)
		}
		
	}
	
	chart(target, config) {
		Chart.chart(target, this, config);
	}
	
	toCsv(config) {
		const cell = function(c) {
			let quote = /"/g;
			return typeof c == "string" && (c.indexOf(",")>-1 || c.indexOf('"')>-1) ? '"'+c.replace(quote,'\"')+'"' : c;
		}
		return (config && "noHeaders" in config && config.noHeaders ? "" : this.headers(true).map(h => cell(h)).join(",") + "\n") +
			this._rows.map(row => row.map(c => cell(c)).join(",")).join("\n")
	}
	
	toTsv(config) {
		return config && "noHeaders" in config && config.noHeaders ? "" : this.headers(true).join("\t") + "\n" +
			this._rows.map(row => row.join("\t")).join("\n");
	}
	
	html(target, config) {
		let html = this.toHtml();
		if (typeof target == "function") {
			target(html)
		} else {
			if (typeof target == "string") {
				target = document.querySelector(target);
				if (!target) {
					throw "Unable to find specified target: "+target;
				}
			}
			if (typeof target == "object" && "innerHTML" in target) {
				target.innerHTML = html;
			}
		}
		return this;
	}
	
	toHtml(config) {
		return "<table class='voyantTable'>" +
			((config && "caption" in config && typeof config.caption == "string") ?
					"<caption>"+config.caption+"</caption>" : "") +
			((config && "noHeaders" in config && config.noHeaders) ? "" : ("<tr>"+this.headers(true).map(c => "<th>"+c+"</th>")+"</tr>"))+
			this._rows.map(row => "<tr>"+row.map(c => "<td>"+c+"</td>")+"</tr>") +
			"</table>";
	}
	
	static create(config, data) {
		return new Table(config, data);
	}
	
	static fetch(input, api, config) {
		return new Promise((resolve, reject) => {
			fetch(input, api).then(response => {
				if (!response.ok) {throw new Error(response.status + " " + response.statusText);}
				let inp = response.text();
				let table = Table.create(inp, config || api);  
				resolve(table);
			})
		})
	}
}

function sum(data) {
	return data.reduce((a,b) => a+b, 0);
}

function mean(data) {
	return sum(data) / data.length;
}

function rollingMean(data, neighbors) {
	// https://stackoverflow.com/questions/41386083/plot-rolling-moving-average-in-d3-js-v4/41388581#41387286
	return data.map((val, idx, arr) => {
		let start = Math.max(0, idx - neighbors), end = idx + neighbors
		let subset = arr.slice(start, end + 1)
		let sum = subset.reduce((a,b) => a + b)
		return sum / subset.length
	});
}

function variance(data) {
	let m = mean(data);
	return mean(data.map(num => Math.pow(num-m, 2)));
}

function standardDeviation(data) {
	return Math.sqrt(variance(data));
}

function zScores(data) {
	let m = mean(data);
	let s = standardDeviation(data);
	return data.map(num => (num-m) / s);
}

function counts(data) {
	let vals = {};
	data.forEach(v => v in vals ? vals[v]++ : vals[v]=1);
	return vals;
}

function zip(...data) {

	// we have a single nested array, so let's recall with flattened arguments
	if (data.length==1 && Array.isArray(data) && data.every(d => Array.isArray(d))) {
		return zip.apply(null, ...data);
	}
	
	// allow arrays to be of different lengths
	let len = Math.max.apply(null, data.map(d => d.length));
	return new Array(len).fill().map((_,i) => data.map(d => d[i]));
}