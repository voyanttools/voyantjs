import Load from './load';
import Util from './util.js';
import Categories from './categories.js';


// this is essentially a private method to determine if we're in corpus or documents mode.
// if docIndex or docId is defined, or if mode=="documents" then we're in documents mode
function isDocumentsMode(config={}) {
	return 'docIndex' in config || 'docId' in config || ('mode' in config && config.mode==='documents');
}

/**
 * The Corpus class in Spyral. To get started you first need to load a Corpus, using either a
 * pre-existing Corpus id, or some input data. For this you can use the [loadCorpus]{@link window.loadCorpus}
 * method, which is an alias of {@link Spyral.Corpus.load}.
 * 
 * Here's a simple example:
 * 
 * 	loadCorpus("Hello World!").summary();
 * 
 * This loads a corpus and returns an asynchronous `Promise`, but all of the methods
 * of Corpus are appended to the Promise, so {@link Spyral.Corpus#summary} will be called
 * once the Corpus promise is fulfilled. It's equivalent to the following:
 *
 * 	loadCorpus("Hello World!").then(corpus -> corpus.summary());
 *
 * Have a look at the {@link Spyral.Corpus~CorpusConfig} configuration for more examples.
 *
 * @memberof Spyral
 * @class
 */
class Corpus {
	
/**
 * The Corpus config
 * @typedef {Object|String} Spyral.Corpus~CorpusConfig
 * 
 * @property {String} corpus The ID of a previously created corpus.
 * 
 * A corpus ID can be used to try to retrieve a corpus that has been previously created.
 * Typically the corpus ID is used as a first string argument, with an optional second
 * argument for other parameters (especially those to recreate the corpus if needed).
 * 
 * 	loadCorpus("goldbug");
 *
 * 	loadCorpus("goldbug", {
 * 		// if corpus ID "goldbug" isn't found, use the input
 * 		input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
 * 		inputRemoveUntil: 'THE GOLD-BUG',
 * 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 	});
 *
 * @property {(String|String[])} input Input sources for the corpus.
 * 
 * The input sources can be either normal text or URLs (starting with `http`).
 * 
 * Typically input sources are specified as a string or an array in the first argument, with an optional second argument for other parameters.
 * 
 * 	loadCorpus("Hello Voyant!"); // one document with this string
 * 
 * 	loadCorpus(["Hello Voyant!", "How are you?"]); // two documents with these strings
 * 
 * 	loadCorpus("http://hermeneuti.ca/"); // one document from URL
 * 
 * 	loadCorpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs
 * 
 * 	loadCorpus(["Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL
 * 
 * 	loadCorpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
 * 		inputRemoveUntil: 'THE GOLD-BUG',
 * 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 	});
 * 
 * 	// use a corpus ID but also specify an input source if the corpus can't be found
 * 	loadCorpus("goldbug", {
 * 		input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
 * 		inputRemoveUntil: 'THE GOLD-BUG',
 * 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
 * 	});
 *
 * @property {String} inputFormat The input format of the corpus (the default is to auto-detect).
 * 
 * The auto-detect format is usually reliable and inputFormat should only be used if the default
 * behaviour isn't desired. Most of the relevant values are used for XML documents:
 * 
 * - **DTOC**: Dynamic Table of Contexts XML format
 * - **HTML**: Hypertext Markup Language
 * - **RSS**: Really Simple Syndication XML format
 * - **TEI**: Text Encoding Initiative XML format
 * - **TEICORPUS**: Text Encoding Initiative Corpus XML format
 * - **TEXT**: plain text
 * - **XML**: treat the document as XML (sometimes overridding auto-detect of XML vocabularies like RSS and TEI)
 * 
 * Other formats include **PDF**, **MSWORD**, **XLSX**, **RTF**, **ODT**, and **ZIP** (but again, these rarely need to be specified).
 *
 * @property {String} tableDocuments Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.
 * 
 * Possible values are:
 * 
 * - **undefined or blank** (default): the entire table is one document
 * - **rows**: each row of the table is a separate document
 * - **columns**: each column of the table is a separate document
 * 
 * See also [Creating a Corpus with Tables](tutorial-corpuscreator.html#tables).
 *
 * @property {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus with Tables](tutorial-corpuscreator.html#tables).
 *
 * @property {String} tableAuthor Determine how to extract the author from each document; only used for table-based documents.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus with Tables](tutorial-corpuscreator.html#tables).
 *
 * @property {String} tableTitle Determine how to extract the title from each document; only used for table-based documents.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus with Tables](tutorial-corpuscreator.html#tables).
 *
 * @property {String} tableGroupBy Specify a column (or columns) by which to group documents; only used for table-based documents, in rows mode.
 * 
 * Columns are referred to by numbers, the first is column 1 (not 0).
 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
 * 
 * Some examples:
 * 
 * - **1**: use column 1
 * - **1,2**: use columns 1 and 2 separately
 * - **1+2,3**: combine columns 1 and two and use column 3 separately
 * 
 * See also [Creating a Corpus with Tables](tutorial-corpuscreator.html#tables).
 *
 * @property {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
 * 
 * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
 * 
 * See also [Creating a Corpus with Tables](tutorial-corpuscreator.html#tables).
 *
 * @property {String} tokenization The tokenization strategy to use
 * 
 * This should usually be undefined, unless specific behaviour is required. These are the valid values:
 * 
 * - **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
 * - **wordBoundaries**: use any Unicode character word boundaries for tokenization
 * - **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)
 * 
 * See also [Creating a Corpus Tokenization](tutorial-corpuscreator.html#processing).
 *
 * @property {String} xmlContentXpath The XPath expression that defines the location of document content (the body); only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
 * 		xmlContentXpath: "//body"
 * 	}); // document would be: "This is Voyant!"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
 * 		xmlTitleXpath: "//title"
 * 	}); // title would be: "Hello world!"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
 * 		xmlAuthorXpath: "//author"
 * 	}); // author would be: "Stéfan Sinclair"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
 * 		xmlPubPlaceXpath: "//pubPlace"
 * 	}); // publication place would be: "Montreal"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
 * 		xmlPublisherXpath: "//publisher"
 * 	}); // publisher would be: "The Owl"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
 * 		xmlKeywordXpath: "//keyword"
 * 	}); // publisher would be: "text analysis"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
 * 		xmlCollectionXpath: "//collection"
 * 	}); // publisher would be: "documentation"
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlDocumentsXpath The XPath expression that defines the location of each document; only used for XML-based documents.
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlGroupByXpath The XPath expression by which to group multiple documents; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
 * 		xmlDocumentsXpath: '//sp',
 * 		xmlGroupByXpath: "//@s"
 * 	}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlExtraMetadataXpath A value that defines the location of other metadata; only used for XML-based documents.
 * 
 * 	loadCorpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
 * 		xmlExtraMetadataXpath: "tool=//tool\nphase=//phase"
 * 	}); // tool would be "Voyant" and phase would be "1"
 * 
 * Note that `xmlExtraMetadataXpath` is a bit different from the other XPath expressions in that it's
 * possible to define multiple values (each on its own line) in the form of name=xpath.
 * 
 * See also [Creating a Corpus with XML](tutorial-corpuscreator.html#xml).
 *
 * @property {String} xmlExtractorTemplate Pass the XML document through the XSL template located at the specified URL before extraction (this is ignored in XML-based documents).
 * 
 * This is an advanced parameter that allows you to define a URL of an XSL template that can
 * be called *before* text extraction (in other words, the other XML-based parameters apply
 * after this template has been processed).
 *
 * @property {String} inputRemoveUntil Omit text up until the start of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 	loadCorpus("Hello world! This is Voyant!", {
 * 		inputRemoveUntil: "This"
 * 	}); // document would be: "This is Voyant!"
 * 
 * See also [Creating a Corpus with Text](tutorial-corpuscreator.html#text).
 *
 * @property {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 	loadCorpus("Hello world! This is Voyant!", {
 * 		inputRemoveUntilAfter: "world!"
 * 	}); // document would be: "This is Voyant!"
 * 
 * See also [Creating a Corpus with Text](tutorial-corpuscreator.html#text).
 *
 * @property {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 	loadCorpus("Hello world! This is Voyant!", {
 * 		inputRemoveFrom: "This"
 * 	}); // document would be: "Hello World!"
 * 
 * See also [Creating a Corpus with Text](tutorial-corpuscreator.html#text).
 *
 * @property {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
 * 
 * 	loadCorpus("Hello world! This is Voyant!", {
 * 		inputRemoveFromAfter: "This"
 * 	}); // document would be: "Hello World! This"
 * 
 * See also [Creating a Corpus with Text](tutorial-corpuscreator.html#text).
 *
 * @property {String} subTitle A sub-title for the corpus.
 * 
 * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.
 *
 * @property {String} title A title for the corpus.
 * 
 * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.
 *
 * @property {String} curatorTsv a simple TSV of paths and labels for the DToC interface (this isn't typically used outside of the specialized DToC context).
 *
 * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
 *
 *   	 p    	 paragraph
 *   	 ref[@target*="religion"]    	 religion
 *
  * For more information see the DToC documentation on [Curating Tags]{@link http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html}
 */
	
	/**
	 * Create a new Corpus using the specified Corpus ID
	 * @constructor
	 * @param {string} id The Corpus ID
	 */
	constructor(id) {
		this.corpusid = id;
	}

	static Load = Load;

	static setBaseUrl(baseUrl) {
		Load.setBaseUrl(baseUrl);
	}

	/**
	 * Returns the ID of the corpus.
	 * 
	 * @returns {Promise<string>} a Promise for the string ID of the corpus
	 */
	id() {
		let me = this;
		return new Promise(resolve => resolve(me.corpusid));
	}

	/*
	 * Create a Corpus and return the ID
	 * @param {Object} config 
	 * @param {Object} api 
	 */
	//	static id(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.id(api || config));
	//	}

	/**
	 * Returns the metadata object (of the corpus or document, depending on which mode is used).
	 * 
	 * The following is an example of the object return for the metadata of the Jane Austen corpus:
	 * 
	 * 	{
	 * 		"id": "b50407fd1cbbecec4315a8fc411bad3c",
	 * 		"alias": "austen",
 	 * 		"title": "",
	 * 		"subTitle": "",
	 * 		"documentsCount": 8,
	 * 		"createdTime": 1582429585984,
	 * 		"createdDate": "2020-02-22T22:46:25.984-0500",
	 * 		"lexicalTokensCount": 781763,
	 * 		"lexicalTypesCount": 15368,
	 * 		"noPasswordAccess": "NORMAL",
	 * 		"languageCodes": [
	 * 			"en"
	 * 		]
	 * 	}
	 * 
	 * The following is an example of what is returned as metadata for the first document:
	 *
	 * 	[
     * 		{
     *   		"id": "ddac6b12c3f4261013c63d04e8d21b45",
     *   		"extra.X-Parsed-By": "org.apache.tika.parser.DefaultParser",
     *   		"tokensCount-lexical": "33559",
     *   		"lastTokenStartOffset-lexical": "259750",
     *   		"parent_modified": "1548457455000",
     *   		"typesCount-lexical": "4235",
     *   		"typesCountMean-lexical": "7.924203",
     *   		"lastTokenPositionIndex-lexical": "33558",
     *   		"index": "0",
     *   		"language": "en",
     *   		"sentencesCount": "1302",
     *   		"source": "stream",
     *   		"typesCountStdDev-lexical": "46.626404",
     *   		"title": "1790 Love And Freindship",
     *   		"parent_queryParameters": "VOYANT_BUILD=M16&textarea-1015-inputEl=Type+in+one+or+more+URLs+on+separate+lines+or+paste+in+a+full+text.&VOYANT_REMOTE_ID=199.229.249.196&accessIP=199.229.249.196&VOYANT_VERSION=2.4&palette=default&suppressTools=false",
     *   		"extra.Content-Type": "text/plain; charset=windows-1252",
     *   		"parentType": "expansion",
     *   		"extra.Content-Encoding": "windows-1252",
     *   		"parent_source": "file",
     *   		"parent_id": "ae47e3a72cd3cad51e196e8a41e21aec",
     *   		"modified": "1432861756000",
     *   		"location": "1790 Love And Freindship.txt",
     *   		"parent_title": "Austen",
     *   		"parent_location": "Austen.zip"
     * 		}
     * 	]
	 * 
	 * In Corpus mode there's no reason to specify arguments. In documents mode you
	 * can request specific documents in the config object:
	 * 
	 *  * **start**: the zero-based start of the list
	 *  * **limit**: a limit to the number of items to return at a time
	 *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	 *  * **query**: one or more term queries for the title, author or full-text
	 *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 *  An example:
	 *  
	 *  	// this would show the number 8 (the size of the corpus)
	 *  	loadCorpus("austen").metadata().then(metadata => metadata.documentsCount)
	 *  
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @returns {Promise<object>} a Promise for an Object containing metadata
	 */
	metadata(config) {
		return Load.trombone(config, {
			tool: isDocumentsMode(config) ? 'corpus.DocumentsMetadata' : 'corpus.CorpusMetadata',
			corpus: this.corpusid
		})
		.then(data => isDocumentsMode(config) ? data.documentsMetadata.documents : data.corpus.metadata);
	}

	/*
	 * Create a Corpus and return the metadata
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static metadata(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.metadata(api || config));
	//	}
	
	/**
	 * Returns a brief summary of the corpus that includes essential metadata (documents count, terms count, etc.) 
	 * 
	 * An example:
	 * 
	 * 	loadCorpus("austen").summary();
	 * 
	 * @returns {Promise<string>} a Promise for a string containing a brief summary of the corpus metadata
	 */
	summary() {
		return this.metadata().then(data => {
			return `This corpus (${data.alias ? data.alias : data.id}) has ${data.documentsCount.toLocaleString()} documents with ${data.lexicalTokensCount.toLocaleString()} total words and ${data.lexicalTypesCount.toLocaleString()} unique word forms.`;
		});
	}

	/*
	 * Create a Corpus and return the summary
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static summary(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.summary(api || config));
	//	}
	
	/**
	 * Returns an array of document titles for the corpus.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start of the list
	 *  * **limit**: a limit to the number of items to return at a time
	 *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	 *  * **query**: one or more term queries for the title, author or full-text
	 *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 * An example:
	 *
	 * 	loadCorpus("austen").titles().then(titles => "The last work is: "+titles[titles.length-1])
	 *
	 * @param {Object} config an Object specifying parameters (see list above) 
	 * @param {number} config.start the zero-based start of the list
	 * @param {number} config.limit a limit to the number of items to return at a time
	 * @param {number} config.docIndex a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 * @param {string} config.docId a set of document IDs; multiple documents can be separated by a comma
	 * @param {string} config.query one or more term queries for the title, author or full-text
	 * @param {string} config.sort one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	 * @returns {Promise<Array>} a Promise for an Array of document titles
	 */
	titles(config={}) {
		config.mode = 'documents';
		return this.metadata(config).then(data => data.map(doc => doc.title));
	}

	/**
	 * Returns an array of documents metadata for the corpus.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start of the list
	 *  * **limit**: a limit to the number of items to return at a time
	 *  * **docIndex**: a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 *  * **docId**: a set of document IDs; multiple documents can be separated by a comma
	 *  * **query**: one or more term queries for the title, author or full-text
	 *  * **sort**: one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 * @param {Object} config an Object specifying parameters (see list above) 
	 * @param {number} config.start the zero-based start of the list
	 * @param {number} config.limit a limit to the number of items to return at a time
	 * @param {number} config.docIndex a zero-based list of documents (first document is zero, etc.); multiple documents can be separated by a comma
	 * @param {string} config.docId a set of document IDs; multiple documents can be separated by a comma
	 * @param {string} config.query one or more term queries for the title, author or full-text
	 * @param {string} config.sort one of the following sort orders: `INDEX`, `TITLE`, `AUTHOR`, `TOKENSCOUNTLEXICAL`, `TYPESCOUNTLEXICAL`, `TYPETOKENRATIOLEXICAL`, `PUBDATE`
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	 * @returns {Promise<Array>} a Promise for an Array of documents metadata
	 */
	documents(config={}) {
		config.mode = 'documents';
		return this.metadata(config);
	}

	/*
	 * Create a Corpus and return the titles
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static titles(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.titles(api || config));
	//	}
	
	/**
	 * Returns the text of the entire corpus.
	 * 
	 * Texts are concatenated together with two new lines and three dashes (\\n\\n---\\n\\n)
	 * 
	 * The following are valid in the config parameter:
	 * 
	 * * **noMarkup**: strips away the markup
	 * * **compactSpace**: strips away superfluous spaces and multiple new lines
	 * * **limit**: a limit to the number of characters (per text)
	 * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	 * 
	 * An example:
	 *
	 * 	// fetch 1000 characters from each text in the corpus into a single string
	 * 	loadCorpus("austen").text({limit:1000})
	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @param {boolean} config.noMarkup strips away the markup
	 * @param {boolean} config.compactSpace strips away superfluous spaces and multiple new lines
	 * @param {number} config.limit a limit to the number of characters (per text)
	 * @param {string} config.format `text` for plain text, any other value for the simplified Voyant markup
	 * @returns {Promise<string>} a Promise for a string of the corpus
	 */
	text(config) {
		return this.texts(config).then(data => data.join('\n\n---\n\n'));
	}

	/*
	 * Create a Corpus and return the text
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static text(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.text(api || config));	
	//	}
	
	/**
	 * Returns an array of texts from the entire corpus.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 * * **noMarkup**: strips away the markup
	 * * **compactSpace**: strips away superfluous spaces and multiple new lines
	 * * **limit**: a limit to the number of characters (per text)
	 * * **format**: `text` for plain text, any other value for the simplified Voyant markup
	 * 
	 * An example:
	 *
	 * 	// fetch 1000 characters from each text in the corpus into an Array
	 * 	loadCorpus("austen").texts({limit:1000})
	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @param {boolean} config.noMarkup strips away the markup
	 * @param {boolean} config.compactSpace strips away superfluous spaces and multiple new lines
	 * @param {number} config.limit a limit to the number of characters (per text)
	 * @param {string} config.format `text` for plain text, any other value for the simplified Voyant markup
	 * @returns {Promise<Array>} a Promise for an Array of texts from the corpus
	 */
	texts(config) {
		return Load.trombone(config, {
			tool: 'corpus.CorpusTexts',
			corpus: this.corpusid
		}).then(data => data.texts.texts);
	}

	/*
	 * Create a Corpus and return the texts
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static texts(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.texts(api || config));	
	//	}
	
	/**
	 * Returns an array of terms (either CorpusTerms or DocumentTerms, depending on the specified mode).
	 * These terms are actually types, so information about each type is collected (as opposed to the [tokens]{@link Spyral.Corpus#tokens}
	 * method which is for every occurrence in document order).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus Term (corpus mode):
	 * 
	 * 	{
	 * 		"term": "the",
	 * 		"inDocumentsCount": 8,
	 * 		"rawFreq": 28292,
	 * 		"relativeFreq": 0.036189996,
	 * 		"comparisonRelativeFreqDifference": 0
	 * 	}
	 * 
	 * The following is an example of Document Term (documents mode):
	 * 
	 * 	{
	 * 		"term": "the",
	 * 		"rawFreq": 1333,
	 * 		"relativeFreq": 39721.086,
	 * 		"zscore": 28.419,
	 * 		"zscoreRatio": -373.4891,
	 * 		"tfidf": 0.0,
	 * 		"totalTermsCount": 33559,
 	 * 		"docIndex": 0,
	 * 		"docId": "8a61d5d851a69c03c6ba9cc446713574"
	 * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **minRawFreq**: the minimum raw frequency of terms
	 *  * **query**: a term query (see [search tutorial]{@tutorial search})
	 *  * **stopList**: a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 *  * **withDistributions**: a true value shows distribution across the corpus (corpus mode) or across the document (documents mode)
	 *  * **whiteList**: a keyword list – terms will be limited to this list
	 *  * **tokenType**: the token type to use, by default `lexical` (other possible values might be `title` and `author`)
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 * 
	 * The following are specific to corpus mode:
	 * 
	 *  * **bins**: by default there are the same number of bins as there are documents (for distribution values), this can be modified
	 *  * **corpusComparison**: you can provide the ID of a corpus for comparison of frequency values
	 *  * **inDocumentsCountOnly**: if you don't need term frequencies but only frequency per document set this to true
	 *  * **sort**: the order of the terms, one of the following: `INDOCUMENTSCOUNT, RAWFREQ, TERM, RELATIVEPEAKEDNESS, RELATIVESKEWNESS, COMPARISONRELATIVEFREQDIFFERENCE`
	 *  
	 *  The following are specific to documents mode:
	 * 
	 *  * **bins**: by default the document is divided into 10 equal bins(for distribution values), this can be modified
	 *  * **sort**: the order of the terms, one of the following: `RAWFREQ, RELATIVEFREQ, TERM, TFIDF, ZSCORE`
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 *  
	 * An example:
	 * 
	 * 	// show top 5 terms
   	 * 	loadCorpus("austen").terms({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
   	 *
   	 * 	// show top term for each document
   	 * 	loadCorpus("austen").terms({stopList: 'auto', perDocLimit: 1, mode: 'documents'}).then(terms => terms.map(term => term.term))
   	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @param {number} config.start the zero-based start index of the list (for paging)
	 * @param {number} config.limit the maximum number of terms to provide per request
	 * @param {number} config.minRawFreq the minimum raw frequency of terms
	 * @param {string} config.query a term query (see [search tutorial]{@tutorial search})
	 * @param {string} config.stopList a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 * @param {boolean} config.withDistributions a true value shows distribution across the corpus (corpus mode) or across the document (documents mode)
	 * @param {string} config.whiteList a keyword list – terms will be limited to this list
	 * @param {string} config.tokenType the token type to use, by default `lexical` (other possible values might be `title` and `author`)
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	 * @returns {Promise<Array>} a Promise for a Array of Terms
	 */
	terms(config) {
		return Load.trombone(config, {
			tool: isDocumentsMode(config) ? 'corpus.DocumentTerms' : 'corpus.CorpusTerms',
			corpus: this.corpusid
		}).then(data => isDocumentsMode(config) ? data.documentTerms.terms : data.corpusTerms.terms);
	}

	/*
	 * Create a Corpus and return the terms
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static terms(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.terms(api || config));
	//	}
	
	/**
	 * Returns an array of document tokens.
	 * 
	 * The promise returns an array of document token objects. A document token object can look something like this:
	 * 
	 *		{
	 *			"docId": "8a61d5d851a69c03c6ba9cc446713574",
	 *			"docIndex": 0,
	 *			"term": "LOVE",
	 *			"tokenType": "lexical",
	 *			"rawFreq": 54,
	 *			"position": 0,
	 *			"startOffset": 3,
	 *			"endOffset": 7
	 *		}
	 *
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **stopList**: a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 *  * **whiteList**: a keyword list – terms will be limited to this list
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **noOthers**: only include lexical forms, no other tokens
	 *  * **stripTags**: one of the following: `ALL`, `BLOCKSONLY`, `NONE` (`BLOCKSONLY` tries to maintain blocks for line formatting)
	 *  * **withPosLemmas**: include part-of-speech and lemma information when available (reliability of this may vary by instance)
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 * 
	 * An example:
	 *
	 * 	// load the first 20 tokens (don't include tags, spaces, etc.)
	 * 	loadCorpus("austen").tokens({limit: 20, noOthers: true})
	 *
	 * @param {Object} config an Object specifying parameters (see above)
	 * @param {number} config.start the zero-based start index of the list (for paging)
	 * @param {number} config.limit the maximum number of terms to provide per request
	 * @param {string} config.stopList a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 * @param {string} config.whiteList a keyword list – terms will be limited to this list
	 * @param {number} config.perDocLimit the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 * @param {boolean} config.noOthers only include lexical forms, no other tokens
	 * @param {string} config.stripTags one of the following: `ALL`, `BLOCKSONLY`, `NONE` (`BLOCKSONLY` tries to maintain blocks for line formatting)
	 * @param {boolean} config.withPosLemmas include part-of-speech and lemma information when available (reliability of this may vary by instance)
	 * @param {number} config.docIndex the zero-based index of the documents to include (use commas to separate multiple values)
	 * @param {string} config.docId the document IDs to include (use commas to separate multiple values)
	 * @returns {Promise<Array>} a Promise for an Array of document tokens
	 */
	tokens(config) {
		return Load.trombone(config, {
			tool: 'corpus.DocumentTokens',
			corpus: this.corpusid
		}).then(data => data.documentTokens.tokens);
	}

	/*
	 * Create a Corpus and return the tokens
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static tokens(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.tokens(api || config));
	//	}

	/**
	 * Returns an array of words from the corpus.
	 * 
	 * The array of words are in document order, much like tokens.
	 * 
	 * The following are valid in the config parameter:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **stopList**: a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 *  * **whiteList**: a keyword list – terms will be limited to this list
	 *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 * 
	 * An example:
	 *
	 * 	// load the first 20 words in the corpus
	 * 	loadCorpus("austen").tokens({limit: 20})
	 *
	 * @param {Object} config an Object specifying parameters (see above)
	 * @param {number} config.start the zero-based start index of the list (for paging)
	 * @param {number} config.limit the maximum number of terms to provide per request
	 * @param {string} config.stopList a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 * @param {string} config.whiteList a keyword list – terms will be limited to this list
	 * @param {number} config.perDocLimit the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
	 * @param {number} config.docIndex the zero-based index of the documents to include (use commas to separate multiple values)
	 * @param {string} config.docId the document IDs to include (use commas to separate multiple values)
	 * @returns {Promise<Array>} a Promise for an Array of words
	 */
	words(config = {}) {
		// by default DocumentTokens limits to 50 which probably isn't expected
		if (!('limit' in config)) {config.limit=0;}
		return Load.trombone(config, {
			tool: 'corpus.DocumentTokens',
			noOthers: true,
			corpus: this.corpusid
		}).then(data => data.documentTokens.tokens.map(t => t.term));
	}

	/*
	 * Create a Corpus and return an array of lexical forms (words) in document order.
	 * @param {Object} config 
	 * @param {Object} api 
	 */
	//	static words(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.words(api || config));
	//	}
	
	/**
	 * Returns an array of Objects that contain keywords in contexts (KWICs).
	 * 
	 * An individual KWIC Object looks something like this:
	 * 
     * 	{
     *			"docIndex": 0,
     *			"query": "love",
     *			"term": "love",
     *			"position": 0,
     *			"left": "FREINDSHIP AND OTHER EARLY WORKS",
     *			"middle": "Love",
     *			"right": " And Friendship And Other Early"
     * 	}
     *  
     * The following are valid in the config parameter:
     * 
     *  * **start**: the zero-based start index of the list (for paging)
     *  * **limit**: the maximum number of terms to provide per request
     *  * **query**: a term query (see [search tutorial]{@tutorial search})
     *  * **sort**: the order of the contexts: `TERM, DOCINDEX, POSITION, LEFT, RIGHT`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
     *  * **perDocLimit**: the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
     *  * **stripTags**: for the `left`, `middle` and `right` values, one of the following: `ALL`, `BLOCKSONLY` (tries to maintain blocks for line formatting), `NONE` (default)
     *  * **context**: the size of the context (the number of words on each side of the keyword)
     *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
     *  * **docId**: the document IDs to include (use commas to separate multiple values)
     *  * **overlapStrategy**: determines how to handle cases where there's overlap between KWICs, such as "to be or not to be" when the keyword is "be"; here are the options:
     *      * **none**: nevermind the overlap, keep all words
     *      	* {left: "to", middle: "be", right: "or not to be"} 
     *      	* {left: "to be or not to", middle: "be", right: ""} 
     *      * **first**: priority goes to the first occurrence (some may be dropped)
     *      	* {left: "to", middle: "be", right: "or not to be"} 
     *      * **merge**: balance the words between overlapping occurrences
     *      	* {left: "to", middle: "be", right: "or"} 
     *      	* {left: "not to", middle: "be", right: ""} 
     * 
     * An example:
     * 
     * 	// load the first 20 words in the corpus
     * 	loadCorpus("austen").contexts({query: "love", limit: 10})
     * 
     * @param {Object} config an Object specifying parameters (see above)
     * @param {number} config.start the zero-based start index of the list (for paging)
     * @param {number} config.limit the maximum number of terms to provide per request
     * @param {string} config.query a term query (see [search tutorial]{@tutorial search})
     * @param {string} config.sort the order of the contexts: `TERM, DOCINDEX, POSITION, LEFT, RIGHT`
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
     * @param {number} config.perDocLimit the `limit` parameter is for the total number of terms returned, this parameter allows you to specify a limit value per document
     * @param {string} config.stripTags for the `left`, `middle` and `right` values, one of the following: `ALL`, `BLOCKSONLY` (tries to maintain blocks for line formatting), `NONE` (default)
     * @param {number} config.context the size of the context (the number of words on each side of the keyword)
     * @param {number} config.docIndex the zero-based index of the documents to include (use commas to separate multiple values)
     * @param {string} config.docId the document IDs to include (use commas to separate multiple values)
     * @param {string} config.overlapStrategy determines how to handle cases where there's overlap between KWICs, such as "to be or not to be" when the keyword is "be"
     * @returns {Promise<Array>} a Promise for an Array of KWIC Objects
     */
	contexts(config) {
		if ((!config || !config.query) && console) {console.warn('No query provided for contexts request.');}
		return Load.trombone(config, {
			tool: 'corpus.DocumentContexts',
			corpus: this.corpusid
		}).then(data => data.documentContexts.contexts);
	}
	
	/*
	 * Create a Corpus and return the contexts
	 * @param {Object} config 
	 * @param {Object} api 
	 */
	//	static contexts(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.contexts(api || config));
	//	}
	
	/**
	 * Returns an array of collocates (either document or corpus collocates, depending on the specified mode).
	 * Collocates are terms which appear more frequently in proximity to keywords across the corpus or document.
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus Collocate (corpus mode):
	 * 
	 * 	{
     *   		"term": "love",
     *   		"rawFreq": 568,
     *   		"contextTerm": "mr",
     *   		"contextTermRawFreq": 24
     * 	}
	 * 
	 * The following is an example of Document Collocate (documents mode):
	 * 
	 * 	{
     * 			"docIndex": 4,
     * 			"keyword": "love",
     * 			"keywordContextRawFrequency": 124,
     * 			"term": "fanny",
     * 			"termContextRawFrequency": 8,
     * 			"termContextRelativeFrequency": 0.021680217,
     * 			"termDocumentRawFrequency": 816,
     * 			"termDocumentRelativeFrequency": 0.0050853477,
     * 			"termContextDocumentRelativeFrequencyDifference": 0.01659487
     * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **query**: a term query (see [search tutorial]{@tutorial search})
	 *  * **stopList**: a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 *  * **collocatesWhitelist**: collocates will be limited to this list
	 *  * **context**: the size of the context (the number of words on each side of the keyword)
	 *  * **dir**: sort direction, `ASC`ending or `DESC`ending
	 * 
	 * The following are specific to corpus mode:
	 * 
	 *  * **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, CONTEXTTERM, CONTEXTTERMRAWFREQ`
	 *  
	 *  The following are specific to documents mode:
	 * 
	 *  * **sort**: the order of the terms, one of the following: `TERM, REL, REL, RAW, DOCREL, DOCRAW, CONTEXTDOCRELDIFF`
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
	 *  
	 * An example:
	 * 
	 * 	// show top 5 collocate terms
   	 * 	loadCorpus("austen").collocates({stopList: 'auto', limit: 5}).then(terms => terms.map(term => term.term))
   	 * 
	 * @param {Object} config an Object specifying parameters (see list above)
	 * @param {number} config.start the zero-based start index of the list (for paging)
	 * @param {number} config.limit the maximum number of terms to provide per request
	 * @param {string} config.query a term query (see [search tutorial]{@tutorial search})
	 * @param {string} config.stopList a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 * @param {string} config.collocatesWhitelist collocates will be limited to this list
	 * @param {number} config.context the size of the context (the number of words on each side of the keyword)
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	 * @returns {Promise<Array>} a Promise for a Array of Terms
	 */
	collocates(config) {
		if ((!config || !config.query) && console) {console.warn('No query provided for collocates request.');}
		return Load.trombone(config, {
			tool: 'corpus.CorpusCollocates',
			corpus: this.corpusid
		}).then(data => data.corpusCollocates.collocates);
	}
	
	/*
	 * Create a Corpus and return the collocates
	 * @param {Object} config 
	 * @param {Object} api 
	 */
	//	static collocates(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.collocates(api || config));
	//	}

	/**
	 * Returns an array of phrases or n-grams (either document or corpus phrases, depending on the specified mode).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus phrase (corpus mode), without distributions requested:
	 * 
	 * 	{
     *  		"term": "love with",
     *  		"rawFreq": 103,
     *  		"length": 2
     * 	}
	 * 
	 * The following is an example of Document phrase (documents mode), without positions requested:
	 * 
	 * 	{
     *   		"term": "love with",
     *   		"rawFreq": 31,
     *   		"length": 2,
     *   		"docIndex": 5
     * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **minLength**: the minimum length of the phrase
	 *  * **maxLength**: the maximum length of the phrase
	 *  * **minRawFreq**: the minimum raw frequency of the phrase
	 * 	* **sort**: the order of the terms, one of the following: `RAWFREQ, TERM, LENGTH`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
	 *  * **overlapFilter**: it happens that phrases contain other phrases and we need a strategy for handling overlap:
     *      * **NONE**: nevermind the overlap, keep all phrases
     *      * **LENGTHFIRST**: priority goes to the longest phrases
     *      * **RAWFREQFIRST**: priority goes to the highest frequency phrases
     *      * **POSITIONFIRST**: priority goes to the first phrases
     * 
     * The following are specific to documents mode:
     * 
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
     *  
     * An example:
     * 
     * 	// load the first 20 phrases in the corpus
     * 	loadCorpus("austen").phrases({query: "love", limit: 10})
     * 
     * @param {Object} config an Object specifying parameters (see above)
	 * @param {number} config.start the zero-based start index of the list (for paging)
	 * @param {number} config.limit the maximum number of terms to provide per request
	 * @param {number} config.minLength the minimum length of the phrase
	 * @param {number} config.maxLength the maximum length of the phrase
	 * @param {number} config.minRawFreq the minimum raw frequency of the phrase
	 * @param {string} config.sort the order of the terms, one of the following: `RAWFREQ, TERM, LENGTH`
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
	 * @param {string} config.overlapFilter it happens that phrases contain other phrases and we need a strategy for handling overlap
     * @returns {Promise<Array>} a Promise for an Array of phrase Objects
     */
	phrases(config) {
		return Load.trombone(config, {
			tool: isDocumentsMode(config) ? 'corpus.DocumentNgrams' : 'corpus.CorpusNgrams',
			corpus: this.corpusid
		}).then(data => isDocumentsMode(config) ? data.documentNgrams.ngrams : data.corpusNgrams.ngrams);
	}
	
	/*
	 * Create a Corpus and return the phrases
	 * @param {Object} config 
	 * @param {Object} api 
	 */
	//	static phrases(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.phrases(api || config));
	//	}
	
	/**
	 * Returns an array of correlations (either document or corpus correlations, depending on the specified mode).
	 * 
	 * The mode is set to "documents" when any of the following is true
	 * 
	 * * the `mode` parameter is set to "documents"
	 * * a `docIndex` parameter being set
	 * * a `docId` parameter being set
	 * 
	 * The following is an example a Corpus correlation (corpus mode):
	 * 
	 * 	{
     * 		"source": {
     * 			"term": "mrs",
     * 			"inDocumentsCount": 8,
     * 			"rawFreq": 2531,
     * 			"relativePeakedness": 0.46444246,
     * 			"relativeSkewness": -0.44197384
     * 		},
     * 		"target": {
     * 			"term": "love",
     * 			"inDocumentsCount": 8,
     * 			"rawFreq": 568,
     * 			"relativePeakedness": 5.763066,
     * 			"relativeSkewness": 2.2536576
     * 		},
     * 		"correlation": -0.44287738,
     * 		"significance": 0.08580014
     * 	}
	 * 
	 * The following is an example of Document correlation (documents mode), without positions requested:
	 * 
	 * 	{
     * 		"source": {
     * 			"term": "confide",
     * 			"rawFreq": 3,
     * 			"relativeFreq": 89.3948,
     * 			"zscore": -0.10560975,
     * 			"zscoreRatio": -0.7541012,
     * 			"tfidf": 1.1168874E-5,
     * 			"totalTermsCount": 33559,
     * 			"docIndex": 0,
     * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
     * 		},
     * 		"target": {
     * 			"term": "love",
     * 			"rawFreq": 54,
     * 			"relativeFreq": 1609.1063,
     * 			"zscore": 53.830048,
     * 			"zscoreRatio": -707.44696,
     * 			"tfidf": 0.0,
     * 			"totalTermsCount": 33559,
     * 			"docIndex": 0,
     * 			"docId": "8a61d5d851a69c03c6ba9cc446713574"
     * 		},
     * 		"correlation": 0.93527687,
     * 		"significance": 7.0970666E-5
     * 	}
	 * 
	 * The following config parameters are valid in both modes:
	 * 
	 *  * **start**: the zero-based start index of the list (for paging)
	 *  * **limit**: the maximum number of terms to provide per request
	 *  * **termsOnly**: a very compact data view of the correlations
	 *  * **sort**: the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	 *  * **dir**: sort direction, **`ASC`**ending or **`DESC`**ending
     * 
	 * The following is specific to corpus mode:
	 * 
	 *  * **minInDocumentsCountRatio**: the minimum coverage (as a percentage between 0 and 100) of the term, amongst all the documents
	 * 
     * The following are specific to documents mode:
     * 
	 *  * **docIndex**: the zero-based index of the documents to include (use commas to separate multiple values)
	 *  * **docId**: the document IDs to include (use commas to separate multiple values)
     *  
     * An example:
     * 
     * 	// load the first 10 phrases in the corpus
     * 	loadCorpus("austen").correlations({query: "love", limit: 10})
     * 
     * @param {Object} config an Object specifying parameters (see above)
	 * @param {number} config.start the zero-based start index of the list (for paging)
	 * @param {number} config.limit the maximum number of terms to provide per request
	 * @param {number} config.minInDocumentsCountRatio the minimum coverage (as a percentage between 0 and 100) of the term, amongst all the documents
	 * @param {boolean} config.termsOnly a very compact data view of the correlations
	 * @param {string} config.sort the order of the terms, one of the following: `CORRELATION`, `CORRELATIONABS`
	 * @param {string} config.dir sort direction, **`ASC`**ending or **`DESC`**ending
     * @returns {Promise<Array>} a Promise for an Array of phrase Objects
     */
	correlations(config) {
		if ((!config || !config.query) && console) {
			console.warn('No query provided for correlations request.');
			if (!isDocumentsMode(config)) {
				throw new Error('Unable to run correlations for a corpus without a query.');
			}
		}
		return Load.trombone(config, {
			tool: isDocumentsMode(config) ? 'corpus.DocumentTermCorrelations' : 'corpus.CorpusTermCorrelations',
			corpus: this.corpusid
		}).then(data => data.termCorrelations.correlations);
	}
	
	/*
	 * Create a Corpus and return the correlations
	 * @param {Object} config 
	 * @param {Object} api 
	 */
	//	static correlations(config, api) {
	//		return Corpus.load(config).then(corpus => corpus.correlations(api || config));
	//	}

	/**
	 * Get lemmas. This is the equivalent of calling: this.tokens({ withPosLemmas: true, noOthers: true })
	 * @param {Object} config an Object specifying parameters (see above)
     * @returns {Promise<Array>} a Promise for an Array of lemma Objects
	 */
	lemmas(config={}) {
		config.withPosLemmas = true;
		config.noOthers = true;
		return this.tokens(config);
	}

	/**
	 * Performs topic modelling using the latent Dirichlet allocation. Returns an object that has two primary properties:
	 * 
	 * * **topics**: an array of topics (words organized into bunches of a specified size)
	 * * **topicDocuments**: an array of documents and their topic weights
	 *
	 * Each topic in the **topics** array is an object with the following properties:
	 * 
	 * * **words**: an array of the actual words that form the topic. Each word has the same properties as the topic, as well as a "word" property that contains the text content.
	 * * tokens
	 * * documentEntropy
	 * * wordLength
	 * * coherence
	 * * uniformDist
	 * * corpusDist
	 * * effNumWords
	 * * tokenDocDiff
	 * * rank1Docs
	 * * allocationRatio
	 * * allocationCount
	 * * exclusivity
	 * 
	 * Each document in the **topicDocuments** array is an object with the following properties:
	 * 
	 *  * docId: the document ID
	 *  * weights: an array of the numbers corresponding to the the weight of each topic in this document
	 * 
	 * The config object as parameter can contain the following:
	 * 
	 * * **topics**: the number of topics to get (default is 10)
	 * * **termsPerTopic**: the number of terms for each topic (default is 10)
	 * * **iterations**: the number of iterations to do, more iterations = more accurate (default is 100)
	 * * **perDocLimit**: the token limit per document, starting at the beginning of the document
	 * * **seed**: specify a particular seed to use for random number generation
	 * * **stopList**: a list of stopwords to include
	 * 
	 * @param {Object} config (see above)
	 * @param {number} config.topics the number of topics to get (default is 10)
	 * @param {number} config.termsPerTopic the number of terms for each topic (default is 10)
	 * @param {number} config.iterations the number of iterations to do, more iterations = more accurate (default is 100)
	 * @param {number} config.perDocLimit specify a token limit per document, starting at the beginning of the document
	 * @param {number} config.seed specify a particular seed to use for random number generation
	 * @param {string} config.stopList a list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 * @returns {Promise<Object>}
	 */
	async topics(config = {topics: 10, termsPerTopic: 10, iterations: 100, seed: 0, stopList: 'auto'}) {
		return Load.trombone(config, {
			tool: 'analysis.TopicModeling',
			corpus: this.corpusid
		}).then(data => data.topicModeling);
	}
	
	/**
	 * Returns an array of entities.
	 * 
	 * The config object as parameter can contain the following:
	 * 
	 *  * **docIndex**: document index to restrict to (can be comma-separated list)
	 *  * **annotator**: the annotator to use: 'stanford' or 'nssi' or 'spacy'
	 * 
	 * @param {Object} config
	 * @param {(number|string)} config.docIndex document index to restrict to (can be comma-separated list)
	 * @param {string} config.annotator the annotator to use: 'stanford' or 'nssi' or 'spacy'
	 * @returns {Promise<Array>}
	 */
	entities(config = {annotator: 'stanford'}) {
		const timeoutDelay = 5000;
		const corpusId = this.corpusid;
		return new Promise((resolve, reject) => {
			function doLoad(config) {
				Load.trombone(config, {
					tool: 'corpus.DocumentEntities',
					includeEntities: true,
					noCache: true, // never cache, we don't want stale entity status
					corpus: corpusId
				}).then(data => {
					const total = data.documentEntities.status.length;
					let numDone = 0;
					let hasFailures = false;
					data.documentEntities.status.forEach(function(item) {
						if (item[1] === 'done') numDone++;
						else if (item[1].indexOf('failed') === 0) {
							numDone++;
							hasFailures = true;
						}
					});
					const isDone = numDone === total;

					if (isDone) {
						if (hasFailures && numDone === 1) {
							reject('Failed to get entities');
						} else {
							resolve(data.documentEntities.entities);
						}
					} else {
						delete config.retryFailures;
						setTimeout(doLoad.bind(this, config), timeoutDelay);
					}

				}, (error) => reject(error));
			}
			
			doLoad(config);
		});
	}

	/**
	 * Given a Categories instance or ID, returns an object mapping category names to corpus terms. The results can be limited to specific category names by providing one or more of them.
	 * @param {String|Spyral.Categories} categories A categories ID or a Spyral.Categories instance.
	 * @param {String|Array<String>} [categoryName] One or more names of categories within the instance.
	 * @returns {Promise<Object>}
	 */
	async filterByCategory(categories, categoryName) {
		if (categories === undefined) return;
		
		if (categories instanceof Categories === false) {
			categories = await Categories.load(categories);
		}

		let categoryNames = [];

		// TODO make sure categoryName is a valid key for categories
		if (categoryName === undefined) {
			categoryNames = categories.getCategoryNames();
		} else if (Util.isString(categoryName)) {
			categoryNames = [categoryName];
		} else {
			categoryNames = categoryName;
		}

		const termsResults = await Promise.all(
			categoryNames.map(key => {
				let catTerms = categories.getCategoryTerms(key);
				return this.terms({whiteList: catTerms});
			})
		);

		let results = {};
		termsResults.forEach((terms, i) => {
			results[categoryNames[i]] = terms;
		});

		return results;
	}

	/**
	 * Performs one of several dimension reduction statistical analysis techniques.
	 * 
	 * For more details see the [scatterplot tutorial]{@tutorial scatterplot}.
	 * 
	 * @param {Object} config 
	 * @param {string} config.type The type of analysis technique to use: 'ca', 'pca', 'tsne', 'docsim'
	 * @param {number} config.start The zero-based start of the list
	 * @param {number} config.limit A limit to the number of items to return at a time
	 * @param {number} config.dimensions The number of dimensions to render, either 2 or 3.
	 * @param {number} config.bins The number of bins to separate a document into.
	 * @param {number} config.clusters The number of clusters within which to group words.
	 * @param {number} config.perplexity The TSNE perplexity value.
	 * @param {number} config.iterations The TSNE iterations value.
	 * @param {string} config.comparisonType The value to use for comparing terms. Options are: 'raw', 'relative', and 'tfidf'.
	 * @param {string} config.target The term to set as the target. This will filter results to terms that are near the target.
	 * @param {string} config.term Used in combination with "target" as a white list of terms to keep.
	 * @param {string} config.query A term query (see [search tutorial]{@tutorial search})
	 * @param {string} config.stopList A list of stopwords to include (see [stopwords tutorial]{@tutorial stopwords})
	 * @returns {Promise<Object>}
	 */
	analysis(config = {}) {
		config = Object.assign({
			type: 'ca', start: 0, limit: 50, dimensions: 3, bins: 10, clusters: 3, perplexity: 15, iterations: 1500, comparisonType: 'relative', target: undefined, term: undefined, query: undefined, stopList: 'auto'
		}, config);
		const analysis = config.type.toLowerCase();
		delete config.type;
		let tool = '';
		let root = '';
		if (analysis === 'tsne') {
			tool = 'corpus.TSNE';
			root = 'tsneAnalysis';
		} else if (analysis === 'pca') {
			tool = 'corpus.PCA';
			root = 'pcaAnalysis';
		} else if (analysis === 'docsim') {
			tool = 'corpus.DocumentSimilarity';
			root = 'documentSimilarity';
		} else {
			tool = 'corpus.CA';
			root = 'correspondenceAnalysis';
		}
		return Load.trombone(config, {
			tool,
			withDistributions: true,
			corpus: this.corpusid
		}).then(data => data[root]);
	}

	/**
	 * Returns an HTML snippet that will produce the specified Voyant tools to appear.
	 * 
	 * In its simplest form we can simply call the named tool:
	 * 
	 * 	loadCorpus("austen").tool("Cirrus");
	 * 
	 * Each tool supports some options (that are summarized below), and those can be specified as options:
	 * 
	 * 	loadCorpus("austen").tool("Trends", {query: "love"});
	 * 
	 * There are also parameters (width, height, style, float) that apply to the actual tool window:
	 * 
	 * 	loadCorpus("austen").tool("Trends", {query: "love", style: "width: 500px; height: 500px"});
	 * 
	 * It's also possible to have several tools appear at once, though they won't be connected by events (clicking in a window won't modify the other windows):
	 * 
	 * 	loadCorpus("austen").tool("Cirrus", "Trends");
	 * 
	 * One easy way to get connected tools is to use the `CustomSet` tool and experiment with the layout:
	 * 
	 * 	loadCorpus("austen").tool("CustomSet", {tableLayout: "Cirrus,Trends", style: "width:800px; height: 500px"});
	 * 
	 * See [the list of corpus tools]{@link Tools} for available tools and options.
	 * 
	 * @param {string} tool The tool to display
	 * @param {Object} config The config object for the tool
	 * @returns {Promise<string>}
	 */
	tool(_tool, config = {}) {
		let me = this;
		return new Promise((resolve, reject) => {
			let isTool = function(obj) {return obj && (typeof obj==='string' && /\W/.test(obj)===false) || (typeof obj === 'object' && 'forTool' in obj);};
			let isConfig = function(obj) {return obj && typeof obj === 'object' && !('forTool' in obj);};
			let lastArg = arguments[arguments.length-1];
			config = isConfig(lastArg) ? lastArg : {};
			
			// we have all tools and we'll show them individually
			if (isTool(_tool) && (isTool(lastArg) || isConfig(lastArg))) {
				let defaultAttributes = {
					style: ''
				};
				let out = '';
				for (let i=0; i<arguments.length; i++) {
					let t = arguments[i];
					if (isTool(t)) {
						if (typeof t === 'string') {t = {forTool: t};} // make sure we have object
						
						// process width and height info
						var width = config['width'] !== undefined ? config['width']+'' : '100%';
						var height = config['height'] !== undefined ? config['height']+'' : '450';
						if (width.search(/^\d+$/) === 0) width += 'px';
						if (height.search(/^\d+$/) === 0) height += 'px';
						if (config['style'] !== undefined) {
							if (config['style'].indexOf('width') === -1) {
								config['style'] = `width: ${width};` + config['style'];
							}
							if (config['style'].indexOf('height') === -1) {
								config['style'] = `height: ${height};` + config['style'];
							}
						} else {
							config['style'] = `width: ${width}; height: ${height};`;
						}

						// build iframe tag
						out+='<iframe ';
						for (let attr in defaultAttributes) {
							var val = (attr in t ? t[attr] : undefined) || (attr in config ? config[attr] : undefined) || (attr in defaultAttributes ? defaultAttributes[attr] : undefined);
							if (val!==undefined) {
								out+=' '+attr+'="'+val+'"';
							}
						}
						
						// build url
						var url = new URL((config && config.voyantUrl ? config.voyantUrl : Load.baseUrl) + 'tool/'+t.forTool+'/');
						url.searchParams.append('corpus', me.corpusid);			
						// add API values from config (some may be ignored)
						let all = Object.assign(t,config);
						Object.keys(all).forEach(key => {
							if (key !=='input' && !(key in defaultAttributes)) {
								let value = all[key];
								// TODO need to sort this out, if key is "query" and value is an array then stringify will break the query format for voyant
								// if (typeof value !== 'string') {
								// 	value = JSON.stringify(value);
								// }
								url.searchParams.append(key, value);
							}
						});
						
						// finish tag
						out+=' src="'+url+'"></iframe>';
					}
				}
				return resolve(out);
			} else {
				if (Array.isArray(_tool)) {
					_tool = _tool.join(';');
				}
				
				let defaultAttributes = {
					width: undefined,
					height: undefined,
					style: 'width: 90%; height: '+(350*(_tool ? _tool : '').split(';').length)+'px'
				};
				
				// build iframe tag
				let out ='<iframe ';
				for (let attr in defaultAttributes) {
					var val = (attr in config ? config[attr] : undefined) || (attr in defaultAttributes ? defaultAttributes[attr] : undefined);
					if (val!==undefined) {
						out+=' '+attr+'="'+val+'"';
					}
				}

				// build url
				var url = new URL((config && config.voyantUrl ? config.voyantUrl : Load.baseUrl)+(_tool ? ('?view=customset&tableLayout='+_tool) : ''));
				url.searchParams.append('corpus', me.corpusid);			
				// add API values from config (some may be ignored)
				Object.keys(config).forEach(key => {
					if (key !=='input' && !(key in defaultAttributes)) {
						let value = config[key];
						// if (typeof value !== 'string') {
						// 	value = JSON.stringify(value);
						// }
						url.searchParams.append(key, value);
					}
				});
				resolve(out+' src=\''+url+'\'></iframe>');
			}
		});
	}

	/*
	 * Create a Corpus and return the tool
	 * @param {*} tool 
	 * @param {*} config 
	 * @param {*} api 
	 */
	//	static tool(tool, config, api) {
	//		return Corpus.load(config).then(corpus => corpus.tool(tool, config, api));
	//	}

	/**
	 * An alias for [summary]{@link Spyral.Corpus#summary}.
	 */
	toString() {
		return this.summary();
	}
		
	/*
	 * Create a new Corpus using the provided config
	 * @param {Object} config 
	 */
	//	static create(config) {
	//		return Corpus.load(config);
	//	}

	/**
	 * Load a Corpus using the provided config and api
	 * @param {Spyral.Corpus~CorpusConfig} config the Corpus config
	 * @param {Object} api any additional API values
	 * @returns {Promise<Corpus>}
	 * @static
	 */
	static load(config={}, api = {}) {
		const promise = new Promise(function(resolve, reject) {

			if (config instanceof Corpus) {
				resolve(config);
			}

			if (Util.isString(config)) {
				if (config.length>0 && /\W/.test(config)===false) {
					config = {corpus: config};
				} else {
					config = {input: config};
				}
			} else if (Util.isArray(config) && config.length > 0 && typeof config[0] === 'string') {
				config = {input: config};
			} else if (Util.isBlob(config) || Util.isNode(config) || (Util.isArray(config) && (Util.isBlob(config[0]) || Util.isNode(config[0])))) {
				const formData = new FormData();
				if (Util.isArray(config)) {
					config.forEach(file => {
						if (Util.isNode(file)) {
							const nodeString = new XMLSerializer().serializeToString(file);
							file = new Blob([nodeString], {type: 'text/xml'});
						}
						formData.append('input', file);
						const fileExt = Util.getFileExtensionFromMimeType(file.type);
						formData.append('inputFormat', Util.getVoyantDocumentFormatFromFileExtension(fileExt));
					});
				} else {
					if (Util.isNode(config)) {
						const nodeString = new XMLSerializer().serializeToString(config);
						config = new Blob([nodeString], {type: 'text/xml'});
					}
					formData.set('input', config);
					const fileExt = Util.getFileExtensionFromMimeType(config.type);
					formData.set('inputFormat', Util.getVoyantDocumentFormatFromFileExtension(fileExt));
				}
				
				// append any other form options that may have been included
				if (api && Util.isObject(api)) {
					for (let key in api) {
						formData.set(key, api[key]);
					}
				}

				formData.set('tool', 'corpus.CorpusMetadata');

				config = {
					body: formData,
					method: 'POST'
				};
			} else if (Util.isObject(config)) {
				if (config.inputFormat === 'json' && Util.isString(config.input) === false) {
					config.input = JSON.stringify(config.input);
				}
			}
			
			Load.trombone({...config,...api}, {tool: 'corpus.CorpusMetadata'})
				.then((data) => {
					resolve(new Corpus(data.corpus.metadata.id));
				}, (err) => {
					reject(err);
				});
			
		});

		['analysis','collocates','contexts','correlations','documents','entities','id','topics','lemmas','metadata','phrases','summary','terms','text','texts','titles','toString','tokens','tool','words'].forEach(name => {
			promise[name] = function() {
				var args = arguments;
				return promise.then(corpus => {return corpus[name].apply(corpus, args);});
			};
		});
		
		// TODO document assign
		promise.assign = function(name) {
			return this.then(corpus => {window[name] = corpus; return corpus;});
		};

		return promise;
	}
}

export default Corpus;
