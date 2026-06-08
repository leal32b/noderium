# Auditoria "Estado da Arte" — Noderium

> Relatório de revisão técnica focado em **padronização, performance, elegância,
> simplicidade, testabilidade e escalabilidade**. Objetivo: deixar o MVP num
> estado supremo antes de seguir construindo sobre ele.
>
> - **Data:** 2026-06-07
> - **Escopo:** workspace inteiro (Rust + frontend SolidJS + editor + docs + tooling)
> - **Natureza:** **somente leitura** — nenhum arquivo de código foi alterado.
>   Este documento é a entrega.
> - **Base medida:** ~2.455 linhas de Rust, ~2.425 linhas de TS/TSX, 30 testes Rust
>   + 3 de frontend + 1 de latência do editor.

---

## 1. Sumário executivo

Noderium é um MVP **excepcionalmente bem cuidado** para o estágio em que está: a
arquitetura tem invariantes claros e documentados (15 ADRs + site Starlight), as
fronteiras FSD são reforçadas por lint, o orçamento de performance do editor é
testado em CI, e o código é pequeno, limpo e idiomático. A barra está alta — e é
exatamente por isso que vale endurecer alguns pontos antes de escalar.

O veredito: **aprovado com louvor, com ressalvas concentradas**. Encontrei **1
incoerência arquitetural latente de alto impacto**, **2 questões de
performance/robustez** que ferem princípios explícitos do `CLAUDE.md`, e um
conjunto saudável de **dívida especulativa** (código/dependências/strings sem uso)
que, removida, deixa o projeto verdadeiramente "como se sempre tivesse sido assim".

### Placar por severidade

| Severidade | Qtd. | Tema dominante |
| --- | --- | --- |
| 🔴 Alto | 3 | Coerência do modelo CRDT; transações/reindex; robustez do FTS |
| 🟡 Médio | 6 | Rota morta, dependências especulativas, superfície de API/i18n sem uso, grafo de links |
| 🟢 Baixo | 7 | Comentários desatualizados, higiene de deps, licença/arquivos soltos, cobertura de testes |

Nenhum achado bloqueia o uso atual do app — vários são **latentes** (código
correto hoje porque o caminho problemático ainda não é exercitado). É o momento
ideal para corrigi-los: barato agora, caro depois de 50k blocos e multi-device.

---

## 2. O que já está excelente (manter)

Para uma revisão justa, vale registrar o que **não** deve ser tocado:

- **Golden rule levado a sério.** A separação "CRDT = verdade, SQLite = índice
  derivado" é real e tem teste dedicado ([app-core/src/lib.rs:614](crates/app-core/src/lib.rs:614)).
- **Crates de domínio puras.** `core`/`store`/`crdt`/`srs` não vazam Tauri/UI;
  orquestração isolada em `app-core`; shell fino. Invariante de portabilidade respeitado.
- **Orçamento de performance em CI.** O teste de latência de tecla (p95 < 16ms)
  é um diferencial raro ([packages/editor/src/latency-test.test.ts](packages/editor/src/latency-test.test.ts)).
- **Tipagem rigorosa no front.** `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `verbatimModuleSyntax` — configuração de elite
  ([tsconfig.app.json](apps/desktop/frontend/tsconfig.app.json)).
- **Tokens semânticos de tema.** Nenhum hex hardcoded nos componentes; cores via
  CSS vars com paridade light/dark ([theme.css](apps/desktop/frontend/src/app/styles/theme.css)).
- **FSD reforçado por lint** com mapa explícito de imports permitidos
  ([eslint.config.js](apps/desktop/frontend/eslint.config.js)).
- **Erros tipados em Rust** (`thiserror`, `Result` por crate) e **sem `unwrap`**
  fora de testes (exceto um `expect` justificado em `srs`).
- **Round-trips testados:** CRDT↔snapshot, markdown import↔export, FTS↔triggers.

---

## 3. Achados de alto impacto (🔴)

### F1 — Dois modelos de bloco CRDT divergentes; o "rebuild" canônico lê o container errado

**Categoria:** coerência (princípio #1) · correção · testabilidade
**Severidade:** 🔴 Alto (latente)

Existem **duas representações CRDT incompatíveis** de "os blocos de uma nota" no
mesmo sistema:

| Modelo | Container Loro | Quem escreve | Quem lê |
| --- | --- | --- | --- |
| **Tree** (`NoteDoc`) | `Tree "blocks"` | `add_block`, `create_note`/`open_journal` (seed vazio) | `reindex` / `rebuild_index_from_crdt` |
| **loro-prosemirror** | `Map "doc" → children` | o editor real → `import_editor_snapshot`, `import_markdown` | `blocks_from_prosemirror_snapshot` |

Evidência: `NoteDoc` opera sobre `get_tree("blocks")`
([crdt/src/lib.rs:23,62](crates/crdt/src/lib.rs:23)); o snapshot do editor opera
sobre `get_map("doc")` ([crdt/src/prosemirror.rs:17,33](crates/crdt/src/prosemirror.rs:17)).

O problema concreto está em `rebuild_index_from_crdt`
([app-core/src/lib.rs:180](crates/app-core/src/lib.rs:180)):

```rust
pub fn rebuild_index_from_crdt(&self, note_id: &str) -> Result<()> {
    let doc = self.load_doc(note_id)?;     // NoteDoc::from_snapshot(...)
    self.reindex(note_id, &doc)            // doc.blocks() => lê o Tree "blocks"
}
```

Para **qualquer nota editada de verdade** (journal, notas, importação), o snapshot
persistido tem a forma `Map "doc"` — **não tem** o Tree `"blocks"`. Logo
`doc.blocks()` retorna **vazio**, e `reindex` apaga o índice e reescreve **nada**.
Ou seja: o método chamado `rebuild_index_from_crdt` **esvazia** o índice de notas
reais em vez de reconstruí-lo.

A reconstrução que de fato funciona para notas reais é `import_editor_snapshot`
(via `blocks_from_prosemirror_snapshot`), não o método com nome de "rebuild".

**Por que importa:** o ADR-001 promete que todo índice é reconstruível a partir do
CRDT. O teste que prova isso — `derived_index_is_rebuildable_from_crdt`
([app-core/src/lib.rs:614](crates/app-core/src/lib.rs:614)) — usa o caminho **Tree**
(`add_block` + `rebuild_index_from_crdt`), que o app **não usa em produção**. O
teste dá **falsa confiança**: o caminho real (loro-prosemirror) nunca é exercitado
pela garantia do golden rule. Hoje é latente apenas porque `rebuild_index_from_crdt`
não é exposto como comando Tauri — ninguém o chama em runtime. No dia em que for
acionado ("dispositivo novo / corrupção", exatamente o cenário que o teste simula),
ele zera notas.

**Recomendação (unificar em um único modelo — o do editor):**
1. Reescrever `rebuild_index_from_crdt`/`reindex` para derivar de
   `blocks_from_prosemirror_snapshot(&snapshot)`, eliminando o caminho Tree do
   fluxo de índice.
2. Trocar os seeds vazios (`create_note`/`open_journal` → `persist(NoteDoc::new())`)
   por `blocks_to_prosemirror_snapshot(&[])`, para que **todo** snapshot tenha a
   mesma forma desde a criação.
3. Avaliar a remoção do modelo Tree de `NoteDoc` (`add_block` e amigos) — hoje só
   é usado por testes e pelo comando Tauri morto `add_block` (ver F7). Menos
   código, um único modelo, princípio #2 (simplicidade) atendido.
4. Ajustar o teste do golden rule para reconstruir uma nota **salva pelo editor**
   (snapshot prosemirror), fechando a lacuna de cobertura.

---

### F2 — Persistência sem transação + reindexação total da nota a cada autosave

**Categoria:** performance (princípio #5) · escalabilidade (#6) · atomicidade
**Severidade:** 🔴 Alto

`import_editor_snapshot` e `reindex` ([app-core/src/lib.rs:142,317](crates/app-core/src/lib.rs:142))
executam, **fora de qualquer transação**, uma sequência de:

`save_snapshot` → `delete_blocks_for_note` → *N×* `upsert_block` → `delete_links_from_note`
→ *N×* `insert_link`.

Cada `execute` do rusqlite faz **auto-commit individual** (um `fsync` por statement
no modo default). Para uma nota com *N* blocos isso são *O(N)* commits, e os
triggers do FTS5 disparam a cada `upsert_block`. Pior: isso roda **a cada autosave**
(debounce de 600ms enquanto se digita — [EditorPane.tsx:25,54](apps/desktop/frontend/src/features/editor/ui/EditorPane.tsx:25)),
reindexando a **nota inteira** mesmo que um único bloco tenha mudado.

Em 50k+ blocos (meta explícita do princípio #6), salvar uma nota grande passa a
custar dezenas de milhares de upserts + reconstrução de FTS a cada pausa de
digitação. Fere diretamente "Avoid … needless allocations and N+1 queries" e
"Solutions must hold at 50k+ blocks".

**Recomendações:**
1. **Envolver cada persist em uma transação** (`conn.transaction()` / `unchecked_transaction`
   ou um helper `with_tx`): um único `fsync`, atomicidade (sem índice meio-construído
   se houver crash no meio). Ganho imediato de latência e robustez.
2. **`prepare_cached`** para as queries quentes (`upsert_block`, `insert_link`) em
   vez de `prepare` por chamada.
3. **Médio prazo:** reindex **incremental** — diff entre os blocos novos e os
   existentes (o editor já sabe o que mudou) em vez de delete-all + reinsert. Aqui
   é onde o orçamento de 50k blocos será ganho ou perdido.
4. Considerar `PRAGMA journal_mode=WAL` + `synchronous=NORMAL` na abertura do store
   (durabilidade adequada para local-first, escritas bem mais rápidas).

---

### F3 — Query do usuário entra crua no `MATCH` do FTS5 (quebra com caracteres especiais)

**Categoria:** correção · robustez · UX
**Severidade:** 🔴 Alto

`search_blocks`/`search_blocks_detailed` passam o texto do usuário **diretamente**
para `blocks_fts MATCH ?1` ([store/src/lib.rs:210,223](crates/store/src/lib.rs:210)).
A sintaxe do FTS5 trata `"`, `*`, `:`, `(`, `^`, `AND`/`OR`/`NOT`/`NEAR` como
operadores. Uma busca trivial como `foo"`, `c++`, `(`, ou `a:b` resulta em **erro
de sintaxe SQL** → o comando retorna `Err`.

E esse erro **não é tratado** na paleta de comandos: `void core.searchDetailed(q).then(...)`
([CommandPalette.tsx:44](apps/desktop/frontend/src/widgets/command-palette/ui/CommandPalette.tsx:44))
não tem `.catch` → **unhandled promise rejection** a cada caractere especial
digitado na busca (o caminho mais quente da UI). Combina com F4.

**Recomendações:**
1. **Sanitizar/citar a query** antes do `MATCH`: tokenizar e envolver cada termo
   em aspas duplas (escapando aspas internas), ex. `the "fox"` → `"the" "fox"*`,
   ou usar a coluna como prefixo controlado. Isso transforma entrada livre em uma
   consulta FTS5 sempre válida.
2. Cobrir com teste: busca contendo `"`, `*`, `:`, parênteses, e string vazia.
3. Tratar o erro na borda da UI de qualquer forma (ver F4).

---

## 4. Achados médios (🟡)

### F4 — Tratamento de erro inconsistente; sistema de Toast existe mas nunca é usado

**Categoria:** padronização · robustez
**Severidade:** 🟡 Médio

Há dois padrões convivendo. Alguns handlers tratam erro (try/catch + estado inline:
`EditorPane`, `NotePage.addToReview`, `JournalPage`); outros **não**:

- [CommandPalette.tsx:44](apps/desktop/frontend/src/widgets/command-palette/ui/CommandPalette.tsx:44) — `searchDetailed` sem catch (ver F3)
- [BacklinksPanel.tsx:21](apps/desktop/frontend/src/features/notes/ui/BacklinksPanel.tsx:21) — `backlinks` sem catch
- [NotesPage.tsx:14](apps/desktop/frontend/src/pages/notes/ui/NotesPage.tsx:14) — `newNote` (await sem try/catch)
- [ReviewPage.tsx:20](apps/desktop/frontend/src/pages/review/ui/ReviewPage.tsx:20) — `grade` sem catch

Ao mesmo tempo, existe um `ToastProvider` montando uma região Kobalte
([ToastProvider.tsx](apps/desktop/frontend/src/app/providers/ToastProvider.tsx)),
mas **`toaster.show` nunca é chamado** em lugar nenhum — o feedback de
sucesso/erro é feito com `<span>` inline ad-hoc.

**Recomendação:** escolher **um** caminho de feedback. O elegante: um helper
`notify.error()/.success()` sobre o Toast já existente, e usá-lo em todos os
handlers `core.*`. Isso elimina a inconsistência **e** dá uso ao Toast (ou então
remova o Toast — ver F6). Princípio #1: "one way to do a thing, used everywhere".

---

### F5 — Rota `/settings` referenciada mas inexistente (leva a 404)

**Categoria:** correção · coerência
**Severidade:** 🟡 Médio

O Sidebar tem um item "Settings" → `/settings`
([Sidebar.tsx:25](apps/desktop/frontend/src/widgets/sidebar/ui/Sidebar.tsx:25)) e a
paleta tem o comando `nav.settings` → `navigate('/settings')`
([useDefaultCommands.ts:57](apps/desktop/frontend/src/features/command-defaults/model/useDefaultCommands.ts:57)),
com traduções nos dois dicionários. Mas **não há rota `/settings`** em
[routes/index.tsx](apps/desktop/frontend/src/app/routes/index.tsx) → o usuário cai
no `NotFound`.

**Recomendação:** decidir e alinhar — ou criar a página `Settings` (lugar natural
para o toggle de tema/idioma/densidade, ver F6), ou remover o item de nav, o
comando, os IDs e as 4 chaves i18n correlatas. Hoje é uma promessa quebrada na UI.

---

### F6 — Infraestrutura especulativa sem uso (TanStack Query, env/API_BASE, densidade, ProseMirrorEditor, Toast)

**Categoria:** simplicidade (princípio #2: "no speculative abstraction, no dead code")
**Severidade:** 🟡 Médio

Vários andaimes de "SPA genérica" foram instalados mas nunca conectados:

| Item | Evidência | Situação |
| --- | --- | --- |
| `@tanstack/solid-query` | [QueryProvider.tsx](apps/desktop/frontend/src/app/providers/QueryProvider.tsx) envolve o app | **Nenhuma** `createQuery`/`useQuery` no código; tudo usa `createResource`/`core.*` direto |
| `env` / `VITE_API_BASE_URL` | [env.ts](apps/desktop/frontend/src/shared/config/env.ts) | Exportado mas nunca consumido; e um *API base URL HTTP* **contradiz o ADR-005** (local-first, nunca HTTP) |
| Densidade (comfortable/compact) | [theme.tsx:39](apps/desktop/frontend/src/shared/lib/theme.tsx:39), tokens em [theme.css](apps/desktop/frontend/src/app/styles/theme.css) | Estado + persistência + `data-density` + CSS vars existem, mas **nenhum componente lê** `--control-height`/`--density-space` e **não há controle** para alternar |
| `ProseMirrorEditor` | [ProseMirrorEditor.tsx](packages/editor/src/ProseMirrorEditor.tsx) | Exportado no barrel do pacote, **nunca importado** pelo app (que usa `useLoroEditor` em `EditorPane`); além disso é `.tsx` num pacote que se descreve como "plain TS (no JSX)" |
| Toast | F4 | Montado, nunca acionado |

**Recomendação:** para cada um, **decidir agora**: conectar ou remover. Sugestão:
- Remover `@tanstack/solid-query` e o `QueryProvider` (o app é local-first com
  `createResource`; cache de servidor não se aplica). Tira uma dependência e uma
  camada de provider.
- Remover `env.ts`/`valibot` **ou** repensá-lo sem `API_BASE_URL` (não há HTTP).
- Densidade: ou fazer os componentes (`Button`, inputs) consumirem `--control-height`
  e adicionar um toggle (numa página Settings — fecha F5), ou remover por completo.
- Remover `ProseMirrorEditor` do barrel (ou pará-lo no `editor/spike` se ainda
  serve à página `/editor` — verificar) e manter o pacote JSX-free como anunciado.

Cada remoção é "delete before you add" (princípio #2) e reduz a área de superfície
que 99% da comunidade vai inspecionar.

---

### F7 — Comandos Tauri expostos e nunca chamados pelo frontend

**Categoria:** simplicidade · "keep public APIs minimal"
**Severidade:** 🟡 Médio

Dos 15 comandos registrados em [main.rs:25](apps/desktop/src-tauri/src/main.rs:25),
4 não são invocados por nenhum código do frontend (confirmado por varredura de
`core.*`):

- `add_block` / `note_blocks` — o editor persiste **snapshots**, não usa o fluxo
  bloco-a-bloco; ligados ao modelo Tree morto de F1.
- `search` (retorna só ids) — **substituído** por `search_detailed`, o único usado.
- `import_markdown` — sem GUI de import ainda (planejado; manter, mas marcar como
  pré-FR-10).

**Recomendação:** remover `add_block`, `note_blocks` e `search` da superfície Tauri
(e o `core.addBlock/noteBlocks/search` do cliente em [core.ts](apps/desktop/frontend/src/shared/api/core.ts)),
mantendo a lógica de domínio só onde os testes precisam. Menos superfície =
menos a manter, documentar e versionar.

---

### F8 — Chaves i18n e tipos órfãos nos dois dicionários

**Categoria:** padronização · "remove anything you obsolete"
**Severidade:** 🟡 Médio

Chaves presentes em `en-US` **e** `pt-BR` sem nenhum leitor no código (varredura
confirmada):

- `search.title` / `search.placeholder` / `search.run` / `search.matches` (não há
  página de busca; busca vive na paleta)
- `common.ok` / `common.cancel`
- `navigation.section`
- `command.group.navigate` / `command.group.actions`

Relacionado: o campo `Command.group` e o tipo `CommandGroup`
([entities/command/model/types.ts:1](apps/desktop/frontend/src/entities/command/model/types.ts:1))
são **escritos** em `useDefaultCommands` mas **nunca lidos** (a paleta agrupa por
`kind` command/note, não por `group`).

**Recomendação:** remover as chaves órfãs dos dois dicionários e o campo `group`/
`CommandGroup`. Os dicionários ficam menores e a regra "en-US e pt-BR em sincronia"
fica trivial de manter. (Os pares estão em sincronia hoje — bom; é só podar.)

---

### F9 — Resolução de wikilinks por título exato (frágil a rename e à ordem de criação)

**Categoria:** correção · escalabilidade do grafo
**Severidade:** 🟡 Médio

`reindex_links` resolve o alvo de cada `[[wikilink]]` via `note_id_by_title` (match
exato de título) e só cria a aresta **se o alvo já existir**
([app-core/src/lib.rs:359](crates/app-core/src/lib.rs:359),
[store/src/lib.rs:238](crates/store/src/lib.rs:238)). Consequências:

- **Sem back-fill:** se você escreve `[[Projeto X]]` antes de criar "Projeto X", o
  link nunca aparece nos backlinks (não há reprocessamento quando o alvo nasce).
- **Quebra no rename:** renomear uma nota silenciosamente derruba todos os
  backlinks que apontavam para o título antigo.
- **Títulos duplicados:** `LIMIT 1` escolhe um arbitrário.

Para um PKM Zettelkasten (FR-4 é central), o grafo de links é o produto. Isso vai
gerar "links que somem" — exatamente o tipo de bug que mina a confiança do usuário.

**Recomendação (pode ficar para a próxima fase, mas documentar agora):** guardar
o **alvo não resolvido** (o texto do link) e resolver por id na leitura, ou manter
uma tabela de links pendentes reprocessada quando notas são criadas/renomeadas.
No mínimo, registrar essa limitação na doc de status ao lado das já listadas.

---

## 5. Achados de baixo impacto / polimento (🟢)

### F10 — Comentários e descrições divergem do código

**Categoria:** coerência da documentação
**Severidade:** 🟢 Baixo

- [core/src/lib.rs:1,11](crates/core/src/lib.rs:1) afirma "markdown parser (**comrak**)"
  e "comrak-based markdown import", mas `comrak` **não é dependência** e o parser é
  um leitor de linhas manual ([import.rs](crates/core/src/import.rs)).
- [store/Cargo.toml:3](crates/store/Cargo.toml:3) descreve "FTS5, **sqlite-vec**" —
  sqlite-vec é intencionalmente omitido (a própria migration explica).
- Descrições de crates aspiracionais: `crdt` cita "history compaction, checkpoints"
  (só snapshot existe); `store` cita sqlite-vec.

**Recomendação:** alinhar comentários ao que existe hoje, ou marcar claramente como
"(planejado)". Princípio #3: "comments explain *why*, not *what*" — e nunca devem
descrever algo que não está lá.

### F11 — Dependências Rust não centralizadas; duas bibliotecas de tempo

**Categoria:** padronização · manutenção
**Severidade:** 🟢 Baixo

`[workspace.dependencies]` está **vazio** com o comentário "Populated as crates gain
real dependencies" ([Cargo.toml](Cargo.toml)) — mas as crates já têm deps reais, e
`thiserror = "2"` se repete em 3 crates (store, crdt, app-core), além de `time`,
`loro`, `rs-fsrs`, `chrono` pinados individualmente. Risco de *version drift*.
Além disso, há **duas libs de data/hora**: `time` (em `core`) e `chrono` (em `srs`).

**Recomendação:** hoistar deps comuns para `[workspace.dependencies]` e usar
`thiserror.workspace = true` etc. (o projeto já faz isso para `version`/`edition`).
Quanto a `time` vs `chrono`: `rs-fsrs` força `chrono`, então padronize o resto em
`chrono` (ou mantenha `time` só em `core` e documente o porquê). Uma lib de tempo
no grafo, não duas.

### F12 — Higiene de open-source: falta `LICENSE`; arquivos de prompt soltos na raiz

**Categoria:** prontidão para a comunidade (o critério "aceito por 99%")
**Severidade:** 🟢 Baixo

- **Não há arquivo `LICENSE`** na raiz, embora o workspace declare `Apache-2.0` e o
  README afirme isso. Projetos OSS sérios falham auditoria sem o texto da licença.
  O servidor declara `LicenseRef-FSL-1.1` ([server/sync-server/Cargo.toml](server/sync-server/Cargo.toml))
  sem o respectivo arquivo.
- **Arquivos de andaime na raiz:** `BLUEPRINT_PROMPT.md` (8KB) e
  `starlight-docs-prompt.md` (8.5KB) são *prompts* de processo, não documentação do
  produto (a doc canônica já migrou para `docs/`). Poluem a primeira impressão do repo.

**Recomendação:** adicionar `LICENSE` (Apache-2.0) na raiz e `server/LICENSE` (FSL);
mover os dois `*_PROMPT*.md` para fora do versionamento ou para uma pasta
`internal/` ignorada. Deixa a raiz com a aparência de um projeto polido.

### F13 — Schema com objetos reservados ainda sem uso

**Categoria:** simplicidade vs. previsão
**Severidade:** 🟢 Baixo (informativo)

A migration cria `properties`, `crdt_oplog` e `links.target_block_id`, nenhum
lido/escrito por código Rust hoje (FR-5 e sync v2). É *forward-looking* legítimo,
mas tecnicamente é schema morto no MVP.

**Recomendação:** manter (custo baixo, evita migration futura), porém **comentar no
SQL** que são reservados para FR-5/v2, para que ninguém os confunda com índices
ativos. Já há um bom precedente: a nota sobre `block_vec`/sqlite-vec.

### F14 — pre-commit cobre só o frontend

**Categoria:** padronização de qualidade
**Severidade:** 🟢 Baixo

O hook `pre-commit` roda `lint-staged` **apenas** no pacote frontend
([.husky/pre-commit](.husky/pre-commit)). Um commit que toca **só Rust** não passa
por `cargo fmt`/`clippy` localmente — só estoura no CI.

**Recomendação:** acrescentar ao lint-staged (ou ao hook) um passo para `*.rs`
(`cargo fmt -- --check` + `clippy` no escopo afetado), fechando o ciclo "todo
commit constrói e passa" antes do push.

### F15 — FSD: a regra de boundaries permite import entre slices irmãos

**Categoria:** padronização arquitetural
**Severidade:** 🟢 Baixo

`allowedImports` define `widgets: ['widgets', ...]`
([eslint.config.js](apps/desktop/frontend/eslint.config.js)), o que permite
qualquer widget importar qualquer outro (ex.: `Topbar` importa
`@widgets/command-palette`). A regra de camadas é respeitada, mas o FSD canônico
também proíbe import **entre slices irmãos** da mesma camada — o `eslint-plugin-boundaries`
configurado por *layer* não captura isso.

**Recomendação:** decisão consciente — ou documentar que cross-widget é permitido
de propósito (e então está coerente), ou endurecer para `element-types` por slice.
Hoje não é um bug, é uma ambiguidade a registrar.

### F16 — Lacunas de cobertura de testes

**Categoria:** testabilidade (princípio #4)
**Severidade:** 🟢 Baixo

O Rust está bem coberto (30 testes). As lacunas concentram-se onde os achados acima
moram:

- **Golden rule pelo caminho real** (prosemirror) — ausente (ver F1).
- **FTS com caracteres especiais / query vazia** — ausente (ver F3).
- **Frontend:** só 3 testes (Button, command store, i18n smoke). Sem teste da
  paleta de comandos (navegação por teclado, debounce, merge command+note), do
  atalho ⌘K, ou do fluxo de autosave do `EditorPane`.

**Recomendação:** adicionar os testes que *travam* os achados corrigidos (eles
viram regressões protegidas), e um punhado de testes de componente para a paleta —
é o widget com mais lógica do front.

---

## 6. Plano de ação priorizado

Sequenciado por **impacto ÷ esforço**. Os três primeiros pagam o maior dividendo
de "estado da arte" com pouco código.

| # | Ação | Esforço | Princípio | Sev. |
| --- | --- | --- | --- | --- |
| 1 | Envolver cada persist numa transação + `prepare_cached` (F2) | P | #5 perf | 🔴 |
| 2 | Sanitizar query antes do `MATCH` FTS5 + teste (F3) | P | correção | 🔴 |
| 3 | Unificar no modelo prosemirror: `rebuild`/seed + teste do golden rule real (F1) | M | #1 coerência | 🔴 |
| 4 | Padronizar feedback de erro via Toast (ou remover Toast) (F4) | M | #1 | 🟡 |
| 5 | Resolver `/settings`: criar página ou remover refs+i18n (F5) | P | correção | 🟡 |
| 6 | Podar especulativo: solid-query, env/API_BASE, densidade, ProseMirrorEditor (F6) | M | #2 | 🟡 |
| 7 | Remover comandos Tauri mortos `add_block`/`note_blocks`/`search` (F7) | P | #2 | 🟡 |
| 8 | Podar i18n órfão + campo `Command.group` (F8) | P | #2 | 🟡 |
| 9 | Documentar/endurecer resolução de links (F9) | M | correção | 🟡 |
| 10 | Corrigir comentários comrak/sqlite-vec e descrições de crates (F10) | P | #3 | 🟢 |
| 11 | Centralizar deps em `[workspace.dependencies]`; uma lib de tempo (F11) | P | padronização | 🟢 |
| 12 | Adicionar `LICENSE`(s); tirar `*_PROMPT*.md` da raiz (F12) | P | OSS | 🟢 |
| 13 | Comentar schema reservado (F13); pre-commit p/ Rust (F14); decidir FSD irmãos (F15); testes de regressão (F16) | P–M | #4 | 🟢 |

**Quick wins de 1 commit cada (faça primeiro):** F5, F7, F8, F10, F12 — removem
ruído visível e feiúra sem risco, e já elevam muito a percepção de polimento.

---

## 7. Apêndice — método e evidências

- **Cobertura da leitura:** 100% das fontes Rust (10 crates/bins) e 100% das fontes
  TS/TSX do frontend e do pacote `editor`; todos os configs (Cargo, tsconfig,
  eslint, vite, uno, vitest), CI (`ci.yml`, `docs-deploy.yml`), husky/commitlint,
  migration SQL, tema e os dicionários i18n.
- **Como os "sem uso" foram verificados:** varredura `ripgrep` por referência real
  (ex.: `core.*` invocado, chaves `t('…')`, `data-density`, `toaster`,
  `solid-query`, `comrak`, `sqlite-vec`) excluindo definições/dicionários.
- **Nada foi alterado.** Este `.md` é a única saída desta sessão, conforme pedido.

> **Leitura recomendada a seguir:** comece pelos itens 1–3 do plano. Eles
> transformam o ponto mais frágil (coerência CRDT + performance de escrita +
> robustez da busca) na fundação sólida sobre a qual o resto do roadmap pode ser
> construído "com segurança total".
