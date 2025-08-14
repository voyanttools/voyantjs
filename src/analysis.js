import Load from './load';

// TODO add clustering

/**
 * The Analysis class in Spyral. Used as an alternative to {@link Spyral.Corpus#analysis}
 * for sending vectors directly to the dimension reduction algorithms.
 * 
 * @memberof Spyral
 */
class Analysis {

	/**
	 * Performs Principal Components Analysis on the provided vectors.
	 * @example Spyral.Analysis.pca([[2,3,5],[1,3,4],[3,2,1],[6,5,6],[2,4,1]]);
	 * @param {Array} vectors A 2 dimensional array of numbers.
	 * @param {Number} [dimensions=2] The number of dimensions to reduce to. Default is 2.
	 * @returns {Promise<Array>} 
	 */
	static pca(vectors, dimensions=2) {
		return Analysis._doAnalysis('pca', vectors, {dimensions});
	}

	/**
	 * Performs Correspondence Analysis on the provided vectors.
	 * @example Spyral.Analysis.ca([[2,3,5],[1,3,4],[3,2,1],[6,5,6],[2,4,1]]);
	 * @param {Array} vectors A 2 dimensional array of numbers.
	 * @param {Number} [dimensions=2] The number of dimensions to reduce to. Default is 2.
	 * @returns {Promise<Array>} 
	 */
	static ca(vectors, dimensions=2) {
		return Analysis._doAnalysis('ca', vectors, {dimensions});
	}

	/**
	 * Perform TSNE Analysis on the provided vectors.
	 * @example Spyral.Analysis.tsne([[2,3,5],[1,3,4],[3,2,1],[6,5,6],[2,4,1]]);
	 * @param {Array} vectors A 2 dimensional array of numbers.
	 * @param {Number} [dimensions=2] The number of dimensions to reduce to. Default is 2.
	 * @param {Number} [perplexity=15] The perplexity measure. Default is 15.
	 * @param {Number} [iterations=1500] The number of times to iterate. Default is 1500.
	 * @returns {Promise<Array>} 
	 */
	static tsne(vectors, dimensions=2, perplexity=15, iterations=1500) {
		return Analysis._doAnalysis('tsne', vectors, {dimensions, perplexity, iterations});
	}

	static _doAnalysis(analysis, vectors, config) {
		let tool = '';
		let root = '';
		if (analysis === 'tsne') {
			tool = 'analysis.TSNE';
			root = 'tsneAnalysis';
		} else if (analysis === 'ca') {
			tool = 'analysis.CA';
			root = 'caAnalysis';
		} else {
			tool = 'analysis.PCA';
			root = 'pcaAnalysis';
		}
		if (Array.isArray(vectors)) {
			vectors = JSON.stringify(vectors);
		}
		return Load.trombone(config, {
			tool,
			vectors
		}).then(data => data[root]['vectors']);
	}
}

export default Analysis;