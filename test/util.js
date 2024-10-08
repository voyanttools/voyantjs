/**
 * @jest-environment jsdom
 */

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
		expect(dataUrl).toMatch(/data:text\/plain;base64,Zm9v/);
	});
});

test('blobToString', () => {
	const blob = Util.dataUrlToBlob('data:text/plain;base64,Zm9v');
	return Util.blobToString(blob).then((str) => {
		expect(str).toMatch(/foo/);
	});
});

// test('transformXml', () => {
// 	const xmlDoc = '<foo><bar>baz</bar></foo>';
// 	const xslDoc = `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
// 	<xsl:template match="/foo/bar"><xsl:value-of select="child::text()" /></xsl:template></xsl:stylesheet>`;
// 	const result = Util.transformXml(xmlDoc, xslDoc, false);
// 	expect(result.firstChild.textContent).toMatch('baz');
// })

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

test('isFunction', () => {
	expect(Util.isFunction(()=>{})).toBe(true);
	expect(Util.isFunction(async ()=>{})).toBe(true);
})

test('isPromise', () => {
	expect(Util.isPromise(new Promise(() => {}))).toBe(true);
})

test('isBlob', () => {
	expect(Util.isBlob(new Blob())).toBe(true);
})

test('getFileExtensionFromMimeType', () => {
	expect(Util.getFileExtensionFromMimeType('application/vnd.oasis.opendocument.text')).toBe('odt');
	expect(Util.getFileExtensionFromMimeType('application/json')).toBe('json');
	expect(Util.getFileExtensionFromMimeType('application/x-apple-diskimage')).toBe(undefined);
	expect(Util.getFileExtensionFromMimeType('text/csv')).toBe('txt');
})

test('getVoyantDocumentFormatFromFileExtension', () => {
	expect(Util.getVoyantDocumentFormatFromFileExtension('txt')).toBe('text');
	expect(Util.getVoyantDocumentFormatFromFileExtension('xhtml')).toBe('html');
	expect(Util.getVoyantDocumentFormatFromFileExtension('doc')).toBe('msword');
	expect(Util.getVoyantDocumentFormatFromFileExtension('docx')).toBe('mswordx');
	expect(Util.getVoyantDocumentFormatFromFileExtension('xls')).toBe('xlsx');
	expect(Util.getVoyantDocumentFormatFromFileExtension('zip')).toBe('archive');
	expect(Util.getVoyantDocumentFormatFromFileExtension('gzip')).toBe('compressed');
	expect(Util.getVoyantDocumentFormatFromFileExtension('pdf')).toBe('pdf');
})