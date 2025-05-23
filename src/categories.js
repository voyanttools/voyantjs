import Load from './load';

/**
 * Class for working with categories and features.
 * Categories are groupings of terms.
 * A term can be present in multiple categories. Category ranking is used to determine which feature value to prioritize.
 * Features are arbitrary properties (font, color) that are associated with each category.
 * @memberof Spyral
 * @class
 */
class Categories {

	/**
	 * Construct a new Categories class.
	 * 
	 * @example
	 * new Spyral.Categories({
	 *   categories: {
	 *     positive: ['good', 'happy'],
	 *     negative: ['bad', 'sad']
	 *   },
	 *   categoriesRanking: ['positive','negative'],
	 *   features: {color: {}},
	 *   featureDefaults: {color: '#333333'}
	 * })
	 * @constructor
	 * @param {Object} config The config object
	 * @param {Object} config.categories An object that maps arrays of terms to category names
	 * @param {Array} config.categoriesRanking An array of category names that determines their ranking, from high to low
	 * @param {Object} config.features An object that maps categories to feature names
	 * @param {Object} config.featureDefaults An object that maps default feature value to feature names
	 * @returns {Spyral.Categories}
	 */
	constructor({categories, categoriesRanking, features, featureDefaults} = {categories: {}, categoriesRanking: [], features: {}, featureDefaults: {}}) {
		this.categories = categories;
		this.categoriesRanking = categoriesRanking;
		this.features = features;
		this.featureDefaults = featureDefaults;
	}

	/**
	 * Get the categories.
	 * @returns {Object}
	 */
	getCategories() {
		return this.categories;
	}
	
	/**
	 * Get category names as an array.
	 * @returns {Array}
	 */
	getCategoryNames() {
		return Object.keys(this.getCategories());
	}

	/**
	 * Get the terms for a category.
	 * @param {String} name The category name
	 * @returns {Array}
	 */
	getCategoryTerms(name) {
		return this.categories[name];
	}
	
	/**
	 * Add a new category.
	 * @param {String} name The category name
	 */
	addCategory(name) {
		if (this.categories[name] === undefined) {
			this.categories[name] = [];
			this.categoriesRanking.push(name);
		}
	}

	/**
	 * Rename a category.
	 * @param {String} oldName The old category name
	 * @param {String} newName The new category name
	 */
	renameCategory(oldName, newName) {
		if (oldName !== newName) {
			var terms = this.getCategoryTerms(oldName);
			var ranking = this.getCategoryRanking(oldName);
			this.addTerms(newName, terms);
			for (var feature in this.features) {
				var value = this.features[feature][oldName];
				this.setCategoryFeature(newName, feature, value);
			}
			this.removeCategory(oldName);
			this.setCategoryRanking(newName, ranking);
		}
	}

	/**
	 * Remove a category.
	 * @param {String} name The category name
	 */
	removeCategory(name) {
		delete this.categories[name];
		var index = this.categoriesRanking.indexOf(name);
		if (index !== -1) {
			this.categoriesRanking.splice(index, 1);
		}
		for (var feature in this.features) {
			delete this.features[feature][name];
		}
	}

	/**
	 * Gets the ranking for a category.
	 * @param {String} name The category name
	 * @returns {number}
	 */
	getCategoryRanking(name) {
		var ranking = this.categoriesRanking.indexOf(name);
		if (ranking === -1) {
			return undefined;
		} else {
			return ranking;
		}
	}

	/**
	 * Sets the ranking for a category.
	 * @param {String} name The category name
	 * @param {number} ranking The category ranking
	 */
	setCategoryRanking(name, ranking) {
		if (this.categories[name] !== undefined) {
			ranking = Math.min(this.categoriesRanking.length-1, Math.max(0, ranking));
			var index = this.categoriesRanking.indexOf(name);
			if (index !== -1) {
				this.categoriesRanking.splice(index, 1);
			}
			this.categoriesRanking.splice(ranking, 0, name);
		}
	}

	/**
	 * Add a term to a category.
	 * @param {String} category The category name
	 * @param {String} term The term
	 */
	addTerm(category, term) {
		this.addTerms(category, [term]);
	}

	/**
	 * Add multiple terms to a category.
	 * @param {String} category The category name
	 * @param {Array} terms An array of terms
	 */
	addTerms(category, terms) {
		if (!Array.isArray(terms)) {
			terms = [terms];
		}
		if (this.categories[category] === undefined) {
			this.addCategory(category);
		}
		for (var i = 0; i < terms.length; i++) {
			var term = terms[i];
			if (this.categories[category].indexOf(term) === -1) {
				this.categories[category].push(term);
			}
		}
	}

	/**
	 * Remove a term from a category.
	 * @param {String} category The category name
	 * @param {String} term The term
	 */
	removeTerm(category, term) {
		this.removeTerms(category, [term]);
	}

	/**
	 * Remove multiple terms from a category.
	 * @param {String} category The category name
	 * @param {Array} terms An array of terms
	 */
	removeTerms(category, terms) {
		if (!Array.isArray(terms)) {
			terms = [terms];
		}
		if (this.categories[category] !== undefined) {
			for (var i = 0; i < terms.length; i++) {
				var term = terms[i];
				var index = this.categories[category].indexOf(term);
				if (index !== -1) {
					this.categories[category].splice(index, 1);
				}
			}
		}
	}
	
	/**
	 * Get the category that a term belongs to, taking ranking into account.
	 * @param {String} term The term
	 * @returns {string}
	 */
	getCategoryForTerm(term) {
		var ranking = Number.MAX_VALUE;
		var cat = undefined;
		for (var category in this.categories) {
			if (this.categories[category].indexOf(term) !== -1 && this.getCategoryRanking(category) < ranking) {
				ranking = this.getCategoryRanking(category);
				cat = category;
			}
		}
		return cat;
	}

	/**
	 * Get all the categories a term belongs to.
	 * @param {String} term The term
	 * @returns {Array}
	 */
	getCategoriesForTerm(term) {
		var cats = [];
		for (var category in this.categories) {
			if (this.categories[category].indexOf(term) !== -1) {
				cats.push(category);
			}
		}
		return cats;
	}

	/**
	 * Get the feature for a term.
	 * @param {String} feature The feature
	 * @param {String} term The term
	 * @returns {*}
	 */
	getFeatureForTerm(feature, term) {
		return this.getCategoryFeature(this.getCategoryForTerm(term), feature);
	}
	
	/**
	 * Get the features.
	 * @returns {Object}
	 */
	getFeatures() {
		return this.features;
	}

	/**
	 * Add a feature.
	 * @param {String} name The feature name
	 * @param {*} defaultValue The default value
	 */
	addFeature(name, defaultValue) {
		if (this.features[name] === undefined) {
			this.features[name] = {};
		}
		if (defaultValue !== undefined) {
			this.featureDefaults[name] = defaultValue;
		}
	}

	/**
	 * Remove a feature.
	 * @param {String} name The feature name
	 */
	removeFeature(name) {
		delete this.features[name];
		delete this.featureDefaults[name];
	}

	/**
	 * Set the feature for a category.
	 * @param {String} categoryName The category name
	 * @param {String} featureName The feature name
	 * @param {*} featureValue The feature value
	 */
	setCategoryFeature(categoryName, featureName, featureValue) {
		if (this.features[featureName] === undefined) {
			this.addFeature(featureName);
		}
		this.features[featureName][categoryName] = featureValue;
	}

	/**
	 * Get the feature for a category.
	 * @param {String} categoryName The category name
	 * @param {String} featureName The feature name
	 * @returns {*}
	 */
	getCategoryFeature(categoryName, featureName) {
		var value = undefined;
		if (this.features[featureName] !== undefined) {
			value = this.features[featureName][categoryName];
			if (value === undefined) {
				value = this.featureDefaults[featureName];
				if (typeof value === 'function') {
					value = value();
				}
			}
		}
		return value;
	}
	
	/**
	 * Get a copy of the category and feature data.
	 * @returns {Object}
	 */
	getCategoryExportData() {
		return {
			categories: Object.assign({}, this.categories),
			categoriesRanking: this.categoriesRanking.map(x => x),
			features: Object.assign({}, this.features)
		};
	}
	
	/**
	 * Save the categories (if we're in a recognized environment).
	 * @param {Object} config for the network call (specifying if needed the location of Trombone, etc., see {@link Spyral.Load#trombone}
	 * @param {Object} [api] an object specifying any parameters for the trombone call
	 * @returns {Promise<String>} this returns a promise which eventually resolves to a string that is the ID reference for the stored categories
	 */
	save(config={},api={}) {
		const categoriesData = JSON.stringify(this.getCategoryExportData());
		return Load.trombone(api, Object.assign(config, {
			tool: 'resource.StoredCategories',
			storeResource: categoriesData
		})).then(data => data.storedCategories.id);
	}
	
	/**
	 * Load the categories (if we're in a recognized environment).
	 * 
	 * In its simplest form this can be used with a single string ID to load:
	 * 
	 * 	new Spyral.Categories().load("categories.en.txt")
	 * 
	 * Which is equivalent to:
	 * 
	 * 	new Spyral.Categories().load({retrieveResourceId: "categories.en.txt"});
	 * 
	 * @param {(Object|String)} config an object specifying the parameters (see above)
	 * @param {Object} [api] an object specifying any parameters for the trombone call
	 * @returns {Promise<Object>} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
	 */
	load(config={}, api={}) {
		let me = this;
		if (typeof config === 'string') {
			config =  {'retrieveResourceId': config};
		}
		if (!('retrieveResourceId' in config)) {
			throw Error('You must provide a value for the retrieveResourceId parameter');
		}
		return Load.trombone(api, Object.assign(config, {
			tool: 'resource.StoredCategories'
		})).then(data => {
			const cats = JSON.parse(data.storedCategories.resource);
			me.features = cats.features;
			me.categories = cats.categories;
			me.categoriesRanking = cats.categoriesRanking || [];
			if (me.categoriesRanking.length === 0) {
				for (var category in me.categories) {
					me.categoriesRanking.push(category);
				}
			}
			return me;
		});
	}

	/**
	 * Load categories and return a promise that resolves to a new Spyral.Categories instance.
	 * 
	 * @param {(Object|String)} config an object specifying the parameters (see above)
	 * @param {Object} [api] an object specifying any parameters for the trombone call
	 * @returns {Promise<Object>} this first returns a promise and when the promise is resolved it returns this categories object (with the loaded data included)
	 * @static
	 */
	static load(config={}, api={}) {
		const categories = new Categories();
		return categories.load(config, api);
	}
}

export default Categories;
