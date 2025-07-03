/* global Spyral, Highcharts */

import NetworkGraph from './networkgraph';

import Util from './util.js';

/**
 * The Chart class in Spyral.
 * This class provides methods for creating a variety of charts.
 * Charts are created using the [Highcharts Library]{@link https://api.highcharts.com/highcharts/}.
 * Highcharts have many configuration options and Spyral.Chart helps to streamline the process.
 * A simple example:
 * 
 * 	Spyral.Chart.line({ series: [{ data: [0,2,1,3] }] })
 * 
 * A more complex example:
 * 
 * 	Spyral.Chart.column({
 * 		title: 'Wildflowers',
 * 		series: [{
 * 			name: 'Ontario',
 * 			data: [13, 39, 139, 38]
 * 		},{
 * 			name: 'Quebec',
 * 			data: [14, 33, 94, 30]
 * 		}],
 * 		xAxis: {
 * 			title: 'Number of Petals',
 * 			categories: [3, 4, 5, 6]
 * 		}
 * 	})
 * 
 * @memberof Spyral
 * @class
 */
class Chart {
	/**
	 * The Highcharts config object
	 * @typedef {Object} Spyral.Chart~HighchartsConfig
	 * @property {(string|object)} title
	 * @property {(string|object)} subtitle
	 * @property {Object} credits
	 * @property {Object} xAxis
	 * @property {Object} yAxis
	 * @property {Object} chart
	 * @property {Array<Spyral.Chart~HighchartsSeriesConfig>} series
	 * @property {Object} plotOptions
	 */

	/**
	 * The series config object
	 * @typedef {Object} Spyral.Chart~HighchartsSeriesConfig
	 * @property {Array} data
	 * @property {string} [name]
	 */

	/**
	 * Construct a new Chart class
	 * @constructor
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Array} data An array of data to visualize.
	 */
	constructor(target, data) {
		if (Util.isNode(target)) {
			if (target.isConnected === false) {
				throw new Error('The target node does not exist within the document.');
			}
		} else if (Util.isString(target) === false) {
			data = target;
			target = undefined;
		}
		this.target = target;
		this.data = data;
	}

	/**
	 * Create a new chart.
	 * See [Highcharts API]{@link https://api.highcharts.com/highcharts/} for full set of config options.
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 */
	create(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		return Highcharts.chart(target, config);
	}
	
	/**
	 * Create a new chart.
	 * See [Highcharts API]{@link https://api.highcharts.com/highcharts/} for full set of config options.
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static create(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		return Highcharts.chart(target, config);
	}

	static _handleTargetAndConfig(target, config) {
		if (Util.isNode(target) === false && typeof target === 'object') {
			config = target;
			target = undefined;
		}
		
		if (target === undefined) {
			if (typeof Spyral !== 'undefined' && Spyral.Notebook) {
				target = Spyral.Notebook.getTarget();
				if (target.clientHeight <= 40) {
					target.style.height = '400px'; // 400 is the default Highcharts height
				}
			} else {
				target = document.createElement('div');
				document.body.appendChild(target);
			}
		} else {
			if (Util.isNode(target) && target.isConnected === false) {
				throw new Error('The target node does not exist within the document.');
			}
		}

		// convert title and suppress if not provided
		if ('title' in config) {
			if (typeof config.title === 'string') {
				config.title = {text: config.title};
			}
		} else {
			config.title = false;
		}
		
		// convert subtitle and convert if not provided
		if ('subtitle' in config) {
			if (typeof config.subtitle === 'string') {
				config.subtitle = {text: config.subtitle};
			}
		} else {
			config.subtitle = false;
		}
		
		// convert credits
		if (!('credits' in config)) {
			config.credits = false;
		}
		
		// suppress xAxis title unless provided
		if (!('xAxis' in config)) {config.xAxis = {};}
		if (!('title' in config.xAxis)) {
			config.xAxis.title = false;
		} else if (typeof config.xAxis.title === 'string') {
			config.xAxis.title = {text: config.xAxis.title};
		}
	
		// suppress xAxis title unless provided
		if (!('yAxis' in config)) {config.yAxis = {};}
		if (!('title' in config.yAxis)) {
			config.yAxis.title = false;
		} else if (typeof config.yAxis.title === 'string')  {
			config.yAxis.title = {text: config.yAxis.title};
		}

		return [target, config];
	}

	static _setDefaultChartType(config, type) {
		if ('type' in config) {
			config.chart.type = config.type;
			delete config.type;
			return;
		}
		
		// TODO: check plot options and series?

		if ('chart' in config) {
			if ('type' in config.chart) {return;} // already set
		} else {
			config.chart = {};
		}

		config.chart.type = type;
		return config;
	}

	/**
	 * Add the provided data to the config as a series
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @param {Array} data 
	 * @static
	 */
	static setSeriesData(config, data) {
		if (Array.isArray(data)) {
			if (Array.isArray(data[0])) {
				config.series = data.map(subArray => { return {data: subArray}; });
			} else {
				config.series = [{data: data}];
			}
		}
	}

	/**
	 * Create a bar chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	bar(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.bar(this.target, config);
	}
	/**
	 * Create a bar chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static bar(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'bar');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a column chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	column(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.column(this.target, config);
	}
	/**
	 * Create a column chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static column(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'column');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a line chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	line(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.line(this.target, config);
	}
	/**
	 * Create a line chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static line(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'line');
		return Highcharts.chart(target, config);
	}	

	/**
	 * Create a pie chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	pie(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.pie(this.target, config);
	}
	/**
	 * Create a pie chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static pie(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'pie');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a polar chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	polar(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.polar(this.target, config);
	}
	/**
	 * Create a polar chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static polar(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'polar');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a scatter plot
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	scatter(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.scatter(this.target, config);
	}
	/**
	 * Create a scatter plot
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static scatter(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'scatter');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a network graph
	 * @param {NetworkGraph~Config} [config]
	 * @returns {NetworkGraph}
	 */
	networkgraph(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.networkgraph(this.target, config);
	}
	/**
	 * Create a network graph
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {NetworkGraph~Config} config 
	 * @returns {NetworkGraph}
	 * @static
	 */
	static networkgraph(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		return new NetworkGraph(target, config);
	}

	static _loadHighchartsModule(moduleName) {
		return Util.loadScript(`../resources/highcharts/11/modules/${moduleName}.js`);
	}

	/**
	 * Create an arc-diagram chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	arcdiagram(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.arcdiagram(this.target, config);
	}
	/**
	 * Create an arc-diagram chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async arcdiagram(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'arcdiagram');
		await Chart._loadHighchartsModule('arc-diagram');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a dependency wheel chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	dependencywheel(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.dependencywheel(this.target, config);
	}
	/**
	 * Create a dependency wheel chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async dependencywheel(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'dependencywheel');
		await Chart._loadHighchartsModule('sankey');
		await Chart._loadHighchartsModule('dependency-wheel');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a dumbbell chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	dumbbell(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.dumbbell(this.target, config);
	}
	/**
	 * Create a dumbbell chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async dumbbell(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'dumbbell');
		await Chart._loadHighchartsModule('dumbbell');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a heatmap chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	heatmap(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.heatmap(this.target, config);
	}
	/**
	 * Create a heatmap chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async heatmap(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'heatmap');
		await Chart._loadHighchartsModule('heatmap');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a histogram chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	histogram(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.histogram(this.target, config);
	}
	/**
	 * Create a histogram chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async histogram(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'histogram');
		await Chart._loadHighchartsModule('histogram-bellcurve');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create an item chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	item(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.item(this.target, config);
	}
	/**
	 * Create an item chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async item(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'item');
		await Chart._loadHighchartsModule('item-series');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a map chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	map(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.map(this.target, config);
	}
	/**
	 * Create a map chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async map(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'map');
		await Chart._loadHighchartsModule('map');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a sankey chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	sankey(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.sankey(this.target, config);
	}
	/**
	 * Create a sankey chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async sankey(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'sankey');
		await Chart._loadHighchartsModule('sankey');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a streamgraph chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	streamgraph(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.streamgraph(this.target, config);
	}
	/**
	 * Create a streamgraph chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async streamgraph(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'streamgraph');
		await Chart._loadHighchartsModule('streamgraph');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a sunburst chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	sunburst(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.sunburst(this.target, config);
	}
	/**
	 * Create a sunburst chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async sunburst(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'sunburst');
		await Chart._loadHighchartsModule('sunburst');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a treegraph chart
	 * @param {*} config 
	 * @returns 
	 */
	treegraph(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.treegraph(this.target, config);
	}
	/**
	 * Create a treegraph chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async treegraph(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'treegraph');
		await Chart._loadHighchartsModule('treemap');
		await Chart._loadHighchartsModule('treegraph');
		return Highcharts.chart(target, config);
	}

	/**
	 * Create a treemap chart
	 * @param {Spyral.Chart~HighchartsConfig} [config]
	 * @returns {Highcharts.Chart}
	 */
	treemap(config={}) {
		Chart.setSeriesData(config, this.data);
		return Chart.treemap(this.target, config);
	}
	/**
	 * Create a treemap chart
	 * @param {(String|Element)} [target] An element or ID to use as the chart's target. If not specified, one will be created.
	 * @param {Spyral.Chart~HighchartsConfig} config 
	 * @returns {Highcharts.Chart}
	 * @static
	 */
	static async treemap(target, config) {
		[target, config] = Chart._handleTargetAndConfig(target, config);
		Chart._setDefaultChartType(config, 'treemap');
		await Chart._loadHighchartsModule('treemap');
		return Highcharts.chart(target, config);
	}
}

export default Chart;
