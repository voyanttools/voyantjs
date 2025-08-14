/**
 * @jest-environment jsdom
 */

import Analysis from "../src/analysis";
import Load from '../src/load';

import * as Mocks from './mocks/analysis';

const baseUrl = 'http://localhost:8080/voyant';

const vectors = [[2,3,5],[1,3,4],[3,2,1],[6,5,6],[2,4,1]];

beforeAll(() => {
	Load.setBaseUrl(baseUrl);
})

beforeEach(() => {
	fetch.resetMocks()
})

test('pca', () => {
	fetch.once(JSON.stringify(Mocks.PCAResults));
	return Analysis.pca(vectors).then(results => {
		expect(results[0][0]).toEqual(1.1078741748263636);
	})
})

test('ca', () => {
	fetch.once(JSON.stringify(Mocks.CAResults));
	return Analysis.ca(vectors).then(results => {
		expect(results[0][0]).toEqual(1.0000000000000002);
	})
})

test('tsne', () => {
	fetch.once(JSON.stringify(Mocks.TSNEResults));
	return Analysis.tsne(vectors).then(results => {
		expect(results[0][0]).toEqual(26.745254574961276);
	})
})