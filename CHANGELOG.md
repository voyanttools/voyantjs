## [3.5.2](https://github.com/voyanttools/voyantjs/compare/v3.5.1...v3.5.2) (2025-07-04)


### Bug Fixes

* **chart:** fix map method ([e8a723d](https://github.com/voyanttools/voyantjs/commit/e8a723d20d2e1167767205a494b8f4ad29dfd374))

## [3.5.1](https://github.com/voyanttools/voyantjs/compare/v3.5.0...v3.5.1) (2025-07-03)


### Bug Fixes

* **chart:** add return type so docs will build ([a1bff19](https://github.com/voyanttools/voyantjs/commit/a1bff19f9867a13b563c03f591c57727321c796d))

# [3.5.0](https://github.com/voyanttools/voyantjs/compare/v3.4.1...v3.5.0) (2025-07-03)


### Features

* **chart:** add more chart types, add loadScript method ([aa8866e](https://github.com/voyanttools/voyantjs/commit/aa8866ebda6d829573c6519aa84d3cf5d5e3807b))

## [3.4.1](https://github.com/voyanttools/voyantjs/compare/v3.4.0...v3.4.1) (2025-04-16)


### Bug Fixes

* **corpus:** increase default tool panel size to 100% x 450px ([a98cb9f](https://github.com/voyanttools/voyantjs/commit/a98cb9f0ef654abbf623467aa3026d0f8d4cd619))

# [3.4.0](https://github.com/voyanttools/voyantjs/compare/v3.3.0...v3.4.0) (2025-03-27)


### Features

* **table:** add toArray method ([5c73a27](https://github.com/voyanttools/voyantjs/commit/5c73a279febf06cdf8284e9b0d4c91a3de529559))

# [3.3.0](https://github.com/voyanttools/voyantjs/compare/v3.2.2...v3.3.0) (2025-03-05)


### Features

* **table:** add DataTable output ([3e41248](https://github.com/voyanttools/voyantjs/commit/3e412482d4b1036b720de413c237bfef5f63d21d))

## [3.2.2](https://github.com/voyanttools/voyantjs/compare/v3.2.1...v3.2.2) (2025-02-27)


### Bug Fixes

* **networkgraph:** use nodeIdField as default for nodeLabelField, better documentation ([fc94c11](https://github.com/voyanttools/voyantjs/commit/fc94c11fb2001e4951f378f544e4c0a9bb9adb8e))

## [3.2.1](https://github.com/voyanttools/voyantjs/compare/v3.2.0...v3.2.1) (2025-01-16)


### Bug Fixes

* **corpus:** return object instead of array, make second argument optional ([75c3495](https://github.com/voyanttools/voyantjs/commit/75c3495743c340d07b808c2bafd541f40136f0fa))

# [3.2.0](https://github.com/voyanttools/voyantjs/compare/v3.1.4...v3.2.0) (2025-01-14)


### Features

* **corpus:** add filterByCategory method ([47a2ba3](https://github.com/voyanttools/voyantjs/commit/47a2ba35a609aa022a0f039ea5ef68b560febda5))

## [3.1.4](https://github.com/voyanttools/voyantjs/compare/v3.1.3...v3.1.4) (2024-10-22)


### Bug Fixes

* **load:** auto stringify json when creating corpus from json ([6a28759](https://github.com/voyanttools/voyantjs/commit/6a2875932a975d33cdf8f820d9f86c63b52ca077))

## [3.1.3](https://github.com/voyanttools/voyantjs/compare/v3.1.2...v3.1.3) (2024-09-25)


### Bug Fixes

* **table:** throw error when promise used as data ([dac0926](https://github.com/voyanttools/voyantjs/commit/dac0926bffbc71a0abce5fad96bcd88611291212))

## [3.1.2](https://github.com/voyanttools/voyantjs/compare/v3.1.1...v3.1.2) (2024-09-09)


### Bug Fixes

* **util:** support AsyncFunction ([a2913e9](https://github.com/voyanttools/voyantjs/commit/a2913e91f674c88830f43704e86ddae76f0dbb62))

## [3.1.1](https://github.com/voyanttools/voyantjs/compare/v3.1.0...v3.1.1) (2024-08-16)


### Bug Fixes

* **corpus:** properly specify inputFormat ([624860b](https://github.com/voyanttools/voyantjs/commit/624860ba87f97eb5b1a5f0bced073f19f7bde098))

# [3.1.0](https://github.com/voyanttools/voyantjs/compare/v3.0.5...v3.1.0) (2024-04-29)


### Features

* **corpus:** add analysis method ([aa82e35](https://github.com/voyanttools/voyantjs/commit/aa82e351623b9c563d283215ef50514a11c79a1f))

## [3.0.5](https://github.com/voyanttools/voyantjs/compare/v3.0.4...v3.0.5) (2023-06-16)


### Bug Fixes

* don't restrict blobToString by mime type ([dd2138d](https://github.com/voyanttools/voyantjs/commit/dd2138dda937a1dfd218795358d53481b49d9b4e))

## [3.0.4](https://github.com/voyanttools/voyantjs/compare/v3.0.3...v3.0.4) (2023-03-22)


### Bug Fixes

* **corpus:** use set instead of append in some cases when loading corpus ([d62ddfd](https://github.com/voyanttools/voyantjs/commit/d62ddfd351d3e7f9a78b2343ece2fcad9e9c0641))

## [3.0.3](https://github.com/voyanttools/voyantjs/compare/v3.0.2...v3.0.3) (2023-03-21)


### Bug Fixes

* **util:** add support for text/xml mime type ([ae3d625](https://github.com/voyanttools/voyantjs/commit/ae3d6252f83ab0fadc8cbff127d452a014c0b07b))

## [3.0.2](https://github.com/voyanttools/voyantjs/compare/v3.0.1...v3.0.2) (2023-02-09)


### Bug Fixes

* **util:** add isBlob method ([3f8edc7](https://github.com/voyanttools/voyantjs/commit/3f8edc7b388d52b714a352356f7495e21914b875))

## [3.0.1](https://github.com/voyanttools/voyantjs/compare/v3.0.0...v3.0.1) (2023-01-17)


### Bug Fixes

* **util:** recognize more mime types ([1827c12](https://github.com/voyanttools/voyantjs/commit/1827c1275d0adcc2d38aa9010404799bb0372020))

# [3.0.0](https://github.com/voyanttools/voyantjs/compare/v2.4.0...v3.0.0) (2023-01-06)


### Features

* **corpus:** perform topic modeling on the server instead of the client ([7f8e218](https://github.com/voyanttools/voyantjs/commit/7f8e218170ab90fb295ed380f399017a4cd16501))


### BREAKING CHANGES

* **corpus:** The corpus topic modeling method signature has changed. The 'lda', 'ldaTopics', and
'ldaDocuments' methods have been replaced with 'topics'.

# [2.4.0](https://github.com/voyanttools/voyantjs/compare/v2.3.1...v2.4.0) (2022-11-01)


### Features

* **util:** add blobToString method ([c95009e](https://github.com/voyanttools/voyantjs/commit/c95009e17cffbe1f573eca934d9bbabb3550b75a))

## [2.3.1](https://github.com/voyanttools/voyantjs/compare/v2.3.0...v2.3.1) (2022-09-15)


### Bug Fixes

* change visibility of Corpus constructor and _getParserError ([806d06f](https://github.com/voyanttools/voyantjs/commit/806d06f48169210df78f5b223077f6e3aacbc188))

# [2.3.0](https://github.com/voyanttools/voyantjs/compare/v2.2.0...v2.3.0) (2022-07-28)


### Features

* **lda:** add wordsPerTopic parameter ([24cb17d](https://github.com/voyanttools/voyantjs/commit/24cb17d55e35aab21ccb655bfe61ba2ea190e21d))

# [2.2.0](https://github.com/voyanttools/voyantjs/compare/v2.1.7...v2.2.0) (2022-07-12)


### Bug Fixes

* **table:** use updated Chart methods ([8572bf4](https://github.com/voyanttools/voyantjs/commit/8572bf4dae7768724d979fa9b083278961a93cc5))


### Features

* **chart:** add column method, also some refactoring and documentation ([fd1ed89](https://github.com/voyanttools/voyantjs/commit/fd1ed89c562b43634f544a7b6a62edffb8938742))
* **corpus:** add documents and entities methods ([6e58e01](https://github.com/voyanttools/voyantjs/commit/6e58e017b42fe3a56849557187d6c9ea69253331))
* **util:** add transformXml method ([bc7bba6](https://github.com/voyanttools/voyantjs/commit/bc7bba6678e429f8edbdcebcda6315dcf9793819))

## [2.1.7](https://github.com/voyanttools/voyantjs/compare/v2.1.6...v2.1.7) (2021-10-27)


### Bug Fixes

* **semantic-release:** re-add debug flag ([8dcc0f5](https://github.com/voyanttools/voyantjs/commit/8dcc0f5f437ebc002b3a88b91893c5a6039ccd45))

## [2.1.6](https://github.com/voyanttools/voyantjs/compare/v2.1.5...v2.1.6) (2021-10-27)


### Bug Fixes

* **semantic-release:** specify assets for github ([68f547b](https://github.com/voyanttools/voyantjs/commit/68f547b550220a9c3a9a0299647e325cfeb30324))

## [2.1.5](https://github.com/voyanttools/voyantjs/compare/v2.1.4...v2.1.5) (2021-10-27)


### Bug Fixes

* **semantic-release:** re-add github plugin ([faa669c](https://github.com/voyanttools/voyantjs/commit/faa669c46393178254e5d1257578edba4f923348))

## [2.1.4](https://github.com/voyanttools/voyantjs/compare/v2.1.3...v2.1.4) (2021-10-27)


### Bug Fixes

* **semantic-release:** switch back to git plugin, add debug flag ([02bda0f](https://github.com/voyanttools/voyantjs/commit/02bda0ffb7b28c3647e3df4b6d1e21811d674212))

## [2.1.2](https://github.com/voyanttools/voyantjs/compare/v2.1.1...v2.1.2) (2021-10-27)


### Bug Fixes

* **semantic release:** add required dev dependencies ([8aa770e](https://github.com/voyanttools/voyantjs/commit/8aa770e3a872cb6a85516194d339fe0184b785f6))
* **semantic-release:** add plugins to semantic-release command ([9672fe6](https://github.com/voyanttools/voyantjs/commit/9672fe63800f5d9a14deecc3551cdbaf624b0a3c))
* **semantic-release:** re-order command ([e07abd8](https://github.com/voyanttools/voyantjs/commit/e07abd8ddc9a308908093999f6e67ccd36e6f67e))
