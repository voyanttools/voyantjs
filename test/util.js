import Util from '../src/util';

import * as Mocks from './mocks/corpus';

beforeAll(() => {
})

beforeEach(() => {
})

test('id', () => {
	const id = Util.id(16);
	expect(id.length).toBe(16);
})

test('toString short', () => {
	const string = Util.toString(['foo', 'bar']);
	expect(string).toBe('["foo","bar"]');
})

test('toString long', () => {
	const string = Util.toString(Mocks.DocumentsMetadata);
	expect(string).toMatch('<svg');
})

test('more', () => {
	const string = Util.more('foo', Util.toString(Mocks.DocumentsMetadata), 'bar');
	expect(string).toMatch('foo<svg');
})

test('dataUrlToBlob', () => {
	const blob = Util.dataUrlToBlob('data:text/plain;base64,Zm9v');
	expect(blob instanceof Blob).toBe(true);
})

test('blobToDataUrl', () => {
	const blob = Util.dataUrlToBlob('data:text/plain;base64,Zm9v');
	return Util.blobToDataUrl(blob).then((dataUrl) => {
		expect(dataUrl).toMatch(/foo/);
	});
});

test('isString', () => {
	expect(Util.isString('foo')).toBe(true);
})

test('isNumber', () => {
	expect(Util.isNumber(5)).toBe(true);
})

test('isBoolean', () => {
	expect(Util.isBoolean(false)).toBe(true);
})

test('isUndefined', () => {
	expect(Util.isUndefined(undefined)).toBe(true);
})

test('isArray', () => {
	expect(Util.isArray(['foo'])).toBe(true);
})

test('isObject', () => {
	expect(Util.isObject({'foo': 'bar'})).toBe(true);
})

test('isNull', () => {
	expect(Util.isNull(undefined)).toBe(false);
})

test('isNode', () => {
	expect(Util.isNode('foo')).toBe(false);
})

test('getFileExtensionFromMimeType' () => {
	expect(Util.getFileExtensionFromMimeType('application/vnd.oasis.opendocument.text')).toBe('odt');
	expect(Util.getFileExtensionFromMimeType('application/x-apple-diskimage')).toBe(undefined);
})
