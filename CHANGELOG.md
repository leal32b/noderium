# Changelog

## [0.1.0](https://github.com/leal32b/noderium/compare/v0.0.1...v0.1.0) (2026-06-11)


### Features

* **app-core:** add FSRS card create and review flow ([3ca00c0](https://github.com/leal32b/noderium/commit/3ca00c07af44aeebea2d4ef47f3d4567b74eaee9))
* **app-core:** build backlink graph from wikilinks ([63bbcd2](https://github.com/leal32b/noderium/commit/63bbcd2519857263bac11c34f0929ff8702671e4))
* **app-core:** export a note as markdown ([1e10374](https://github.com/leal32b/noderium/commit/1e103749b06869912c87ba72bbba3a4c671931d8))
* **app-core:** expose a note's stored snapshot ([b09667d](https://github.com/leal32b/noderium/commit/b09667df92b8150af23844c9c79b776708c6a043))
* **app-core:** expose detailed search ([61b24ea](https://github.com/leal32b/noderium/commit/61b24ea003506e85e690329179c85658f6af7387))
* **app-core:** import markdown notes (obsidian-style) ([090ad5b](https://github.com/leal32b/noderium/commit/090ad5be47bb39732d8ca8c42c0992fe8eb3b4e1))
* **app-core:** list notes and auto-title from first block ([9f965a5](https://github.com/leal32b/noderium/commit/9f965a572401a0089187ab51070476726c0900a6))
* **app-core:** open or create a daily journal note ([45be7ae](https://github.com/leal32b/noderium/commit/45be7aefa456ab1011dfa6acc74c9fc3451fbfc5))
* **app-core:** orchestrate crdt + store with rebuildable index ([09d4d27](https://github.com/leal32b/noderium/commit/09d4d277e441ff57dfcafc31449b42d1335b13c3))
* **app-core:** persist and index editor snapshots from JS ([bbb5832](https://github.com/leal32b/noderium/commit/bbb58324996f4b16fa2140f3d77ed07760259bea))
* **core:** add deterministic markdown export ([9c72bfc](https://github.com/leal32b/noderium/commit/9c72bfc36bca9e7d0b10e709a57895a9815f120c))
* **core:** expose wikilink extraction ([cae8f7b](https://github.com/leal32b/noderium/commit/cae8f7ba5222715c7d4dc4bcfa85ae8978b779a0))
* **core:** parse markdown with frontmatter and wikilinks ([8ea1076](https://github.com/leal32b/noderium/commit/8ea1076bb6ffe2b9335da8ecc76bf70e1731d975))
* **crdt:** add Loro-backed note document with block tree and snapshot round-trip ([f259f0e](https://github.com/leal32b/noderium/commit/f259f0eb45abeebfc1a0089ff4378308f0592020))
* **crdt:** parse loro-prosemirror snapshots into blocks ([d5fe13a](https://github.com/leal32b/noderium/commit/d5fe13a81bbcbfd1b113e3ab86c6b388d489fd7e))
* **desktop:** add detailed search and srs review commands ([928032e](https://github.com/leal32b/noderium/commit/928032edf47693fb29c889515662e49c1df61ca4))
* **desktop:** add journal, backlinks, and import commands ([21e98e9](https://github.com/leal32b/noderium/commit/21e98e9ad1d8e8d424d0ebedbb07ab8aaf1e5487))
* **desktop:** add list_notes command ([deeb323](https://github.com/leal32b/noderium/commit/deeb323f5f35940e06845efe5df2e74855eb4d19))
* **desktop:** add load_editor_snapshot command ([e3456d0](https://github.com/leal32b/noderium/commit/e3456d084abf2f6f71b99b71787ade6ffc3b3386))
* **desktop:** add save_editor_snapshot command ([c28781b](https://github.com/leal32b/noderium/commit/c28781b57e8fe643d18e38a93ea8f4c582bc0fcc))
* **desktop:** expose markdown export with an editor button ([ffab0d8](https://github.com/leal32b/noderium/commit/ffab0d87ccac90c4e284a74193400fb16340ef22))
* **desktop:** persist workspace to an on-disk sqlite database ([f7cb83e](https://github.com/leal32b/noderium/commit/f7cb83ec055c4e2f8c0e6cce06810655db638475))
* **desktop:** wire Tauri 2 app exposing app-core via commands ([c2c66c3](https://github.com/leal32b/noderium/commit/c2c66c3698e720bdb2bd2455c61c0c4a486105af))
* **editor-spike:** add ProseMirror + loro-prosemirror setup ([8212919](https://github.com/leal32b/noderium/commit/821291917a837aa1ab1fc1de94eec4b993f57f86))
* **editor:** add onChange callback for autosave ([94697bf](https://github.com/leal32b/noderium/commit/94697bf1e3f47a747b885c514317e8ea829f9533))
* **editor:** add useLoroEditor hook and subpath exports ([9a00440](https://github.com/leal32b/noderium/commit/9a00440987b38c31d4bf7d799a05069d011dabde))
* **editor:** re-hydrate the editor from a stored snapshot ([50ac9d8](https://github.com/leal32b/noderium/commit/50ac9d87526b1907eebedc4ef29cb3e7d4180937))
* **frontend:** add a sectioned settings page reached from the topbar ([8e6158d](https://github.com/leal32b/noderium/commit/8e6158dce63f66ba1a07f40966bd10421f68d415))
* **frontend:** add journal page with search and backlinks ([8adf7f0](https://github.com/leal32b/noderium/commit/8adf7f04bca4ff48806e6bc0a84b9daa537d311c))
* **frontend:** add notes list and per-note pages ([d068f58](https://github.com/leal32b/noderium/commit/d068f58548b5f416449b5fd5349b5730df757794))
* **frontend:** add typed Tauri invoke client for core commands ([4a9ab04](https://github.com/leal32b/noderium/commit/4a9ab04795c55a49f17e2a9df889966beae48d46))
* **frontend:** autosave the journal on a debounce ([032c31d](https://github.com/leal32b/noderium/commit/032c31d72742ac822542f55975ae70187c3f17c6))
* **frontend:** collapsible sidebar with tooltips, centered search bar ([2469c3d](https://github.com/leal32b/noderium/commit/2469c3d310976728715c5f79be2cf31f548d7326))
* **frontend:** flush editor snapshot to the rust core ([5c5d7fd](https://github.com/leal32b/noderium/commit/5c5d7fdec4f9bb1b51bab24fbda15665f987792f))
* **frontend:** integrate Loro block editor at /editor route ([221b1f7](https://github.com/leal32b/noderium/commit/221b1f70bfe9b7950c49902de3a2a8537edf2958))
* **frontend:** load persisted journal content on open ([d5d7204](https://github.com/leal32b/noderium/commit/d5d7204fe83165cfc1fb9359a02d908d4b772880))
* **frontend:** make density scale layout spacing, not just control height ([a11516d](https://github.com/leal32b/noderium/commit/a11516da91c12d247aba63642ca764eb394d6e67))
* **frontend:** scaffold FSD structure, theming, i18n, command palette ([3fcda99](https://github.com/leal32b/noderium/commit/3fcda9961e751aeff86664f6f0bb5bdae15c10c5))
* **frontend:** search snippets and SRS review UI ([d988bb2](https://github.com/leal32b/noderium/commit/d988bb238cb6f21cbcaf30c9cbd3374f3877b477))
* **frontend:** standardize action feedback on a Toast notify helper ([6ffb9ad](https://github.com/leal32b/noderium/commit/6ffb9adc4ea80e09f0a548cbf94ff71046596ffd))
* **frontend:** wire display density to control heights + a settings toggle ([59ede1a](https://github.com/leal32b/noderium/commit/59ede1ab21f6a04f3b9f3b83224d8571a6ce193a))
* **srs:** add FSRS scheduler via rs-fsrs ([954ce21](https://github.com/leal32b/noderium/commit/954ce21019e98c31a51ff21e3eb3e35952f4d4e2))
* **store:** add detailed block search for snippets ([d6c910b](https://github.com/leal32b/noderium/commit/d6c910bc5ae28223b6b3de29080b31b92a527057))
* **store:** add links table queries and backlinks ([75c9c61](https://github.com/leal32b/noderium/commit/75c9c6178815a3c3c030d4305ce5a4aae23c9fb7))
* **store:** add list_notes query ([d0768b1](https://github.com/leal32b/noderium/commit/d0768b1804f622c5f0d0a4680f0a4ae137614483))
* **store:** implement SQLite derived-index schema with FTS5 and tests ([ad21d71](https://github.com/leal32b/noderium/commit/ad21d710d27d05e3a03d114314e948f21deddd45))
* **store:** look up notes by journal date ([5cedce2](https://github.com/leal32b/noderium/commit/5cedce2c51a53cf3ac3179b26fe5bf1e9dbe5c01))
* **store:** persist srs cards with a due-queue index ([3538877](https://github.com/leal32b/noderium/commit/353887779b756b5fb539d8bc2b38f188f48442b3))


### Bug Fixes

* **app-core:** stop journal reopen from wiping persisted content ([3b8eda1](https://github.com/leal32b/noderium/commit/3b8eda1f071edd881f755ef07df86a6cddd1e403))
* **frontend:** disable browser autocomplete on search inputs ([b7489f2](https://github.com/leal32b/noderium/commit/b7489f258af7716e1d48e4bdb050d91fb18a0d67))
* **frontend:** use camelCase keys for tauri command args ([64edce0](https://github.com/leal32b/noderium/commit/64edce0403d79144b6f4d91dc0d1bda5eb64a1c8))
* **store:** sanitize user input before the FTS5 MATCH query ([05bf8cc](https://github.com/leal32b/noderium/commit/05bf8cce614b8e2b3787822d16bd7f7069cefaa5))


### Performance Improvements

* **store:** make a note reindex one transaction with cached statements ([198c662](https://github.com/leal32b/noderium/commit/198c66252f47e10a1066c7c01ebbb9be3a2c6e71))
