/**
 * @jest-environment jsdom
 */

import Categories from '../src/categories';
import Load from '../src/load';

import * as Mocks from './mocks/categories';

const baseUrl = 'http://localhost:8080/voyant';

beforeAll(() => {
	Load.setBaseUrl(baseUrl);
})

beforeEach(() => {
	fetch.resetMocks()
})

test('categories', () => {
	const categories = new Categories();
	categories.addCategory('foo');
	expect(Object.keys(categories.getCategories()).length).toBe(1);
	expect(categories.getCategoryTerms('foo')).toBeDefined();

	categories.renameCategory('foo', 'bar');
	expect(categories.getCategoryTerms('foo')).toBeUndefined();
	expect(categories.getCategoryTerms('bar')).toBeDefined();

	categories.addTerm('bar', 'baz');
	categories.addTerm('bar', 'qux');

	categories.removeTerm('bar', 'baz');
	expect(categories.getCategoryForTerm('qux')).toBe('bar');

	categories.addTerm('foo2', 'qux');
	expect(categories.getCategoriesForTerm('qux').length).toBe(2);

	categories.setCategoryRanking('foo2', 0);
	expect(categories.getCategoryRanking('bar')).toBe(1);
})

test('features', () => {
	const categories = new Categories();
	categories.addFeature('color', '#ff6700');
	expect(categories.getFeatures()['color']).toBeDefined();

	expect(categories.getCategoryFeature('foo', 'color')).toBe('#ff6700');

	categories.addCategory('foo');
	categories.setCategoryFeature('foo', 'color', '#000000');
	expect(categories.getCategoryFeature('foo', 'color')).toBe('#000000');

	categories.removeFeature('color');
	
	const data = categories.getCategoryExportData();
	expect(Object.keys(data.features).length).toBe(0);
})

test('load', () => {
	fetch.once(JSON.stringify(Mocks.Categories));
	return Categories.load('categories.en.txt').then(categories => {
		expect(categories.getCategoryNames()).toEqual(expect.arrayContaining(['positive','negative']));
	})
})
