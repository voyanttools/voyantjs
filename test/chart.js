import Chart from '../src/chart';
import NetworkGraph from '../src/networkgraph';

const seriesData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const networkNodes = [{id: 'A'},{id: 'B'},{id: 'C'},{id: 'D'},{id: 'E'},{id: 'F'},{id: 'G'}];
const networkLinks = [{source: 'A', target: 'D'},{source: 'A', target: 'F'},{source: 'A', target: 'G'},{source: 'B', target: 'C'},{source: 'B', target: 'D'},{source: 'B', target: 'G'},{source: 'C', target: 'D'},{source: 'C', target: 'E'},{source: 'C', target: 'F'},{source: 'D', target: 'G'},{source: 'E', target: 'F'},{source: 'E', target: 'G'}];

beforeEach(() => {
	document.body.innerHTML = '<div id="target"></div>';
})

test('create chart static', () => {
	const chart = Chart.create(document.getElementById('target'), {
		title: 'Foo',
		subtitle: 'Bar',
		credits: '',
		xAxis: {},
		yAxis: {},
		series: [{
			data: seriesData
		}]
	});

	expect(chart.series[0].data.length).toBe(10);
})

test('create chart static minimal config', () => {
	const chart = Chart.create(document.getElementById('target'), {
		series: [{
			data: seriesData
		}]
	});

	expect(chart.series[0].data.length).toBe(10);
})

test('create chart', () => {
	const chart = new Chart(document.getElementById('target'), seriesData)

	expect(chart.data.length).toBe(10);
})

test('setDefaultChartType', () => {
	const config = {
		chart: {}
	};
	Chart.setDefaultChartType(config, 'line');
	expect(config.chart.type).toBe('line')
})

test('bar', () => {
	const chart = new Chart(document.getElementById('target'), seriesData);
	const bar = chart.bar();

	expect(bar.series[0].type).toBe('bar');
})

test('line', () => {
	const chart = new Chart(document.getElementById('target'), seriesData);
	const line = chart.line();
	
	expect(line.series[0].type).toBe('line');
})

test('scatter', () => {
	const chart = new Chart(document.getElementById('target'), seriesData);
	const scatter = chart.scatter();

	expect(scatter.series[0].type).toBe('scatter');
})

// test('networkgraph', () => {
// 	const chart = new Chart(document.getElementById('target'));
// 	const networkgraph = chart.networkgraph({nodes: networkNodes, links: networkLinks});
	
// 	expect(networkgraph instanceof NetworkGraph).toBe(true);
// })
