-- Derived-index schema (ADR-001/ADR-006). Every table here is rebuildable from
-- the CRDT store; only crdt_docs/crdt_oplog are the source of truth.
-- Note: block_vec (sqlite-vec / vec0) is intentionally omitted — it requires the
-- sqlite-vec extension to be loaded at runtime; added when the ai crate lands.

CREATE TABLE notes (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  title         TEXT,
  journal_date  TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE blocks (
  id            TEXT PRIMARY KEY,
  note_id       TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  parent_id     TEXT,
  order_key     TEXT NOT NULL,
  block_type    TEXT NOT NULL,
  text          TEXT NOT NULL DEFAULT ''
);

CREATE INDEX blocks_note_idx ON blocks(note_id, order_key);

-- Reserved for typed properties (FR-5). No code reads/writes this yet; it is
-- created up front to avoid a migration once the block model gains properties.
CREATE TABLE properties (
  owner_id    TEXT NOT NULL,
  key         TEXT NOT NULL,
  value       TEXT,
  value_type  TEXT NOT NULL,
  PRIMARY KEY (owner_id, key)
);

CREATE TABLE links (
  source_block_id TEXT NOT NULL,
  target_note_id  TEXT,
  target_block_id TEXT,
  link_type       TEXT NOT NULL
);

CREATE INDEX links_target_idx ON links(target_note_id);

CREATE VIRTUAL TABLE blocks_fts USING fts5(text, content='blocks', content_rowid='rowid');

CREATE TRIGGER blocks_ai AFTER INSERT ON blocks BEGIN
  INSERT INTO blocks_fts(rowid, text) VALUES (new.rowid, new.text);
END;

CREATE TRIGGER blocks_ad AFTER DELETE ON blocks BEGIN
  INSERT INTO blocks_fts(blocks_fts, rowid, text) VALUES ('delete', old.rowid, old.text);
END;

CREATE TRIGGER blocks_au AFTER UPDATE ON blocks BEGIN
  INSERT INTO blocks_fts(blocks_fts, rowid, text) VALUES ('delete', old.rowid, old.text);
  INSERT INTO blocks_fts(rowid, text) VALUES (new.rowid, new.text);
END;

CREATE TABLE srs_cards (
  id          TEXT PRIMARY KEY,
  target_id   TEXT NOT NULL,
  card_type   TEXT NOT NULL,
  due         INTEGER NOT NULL,
  stability   REAL,
  difficulty  REAL,
  reps        INTEGER,
  lapses      INTEGER,
  state       TEXT,
  last_review INTEGER
);

CREATE INDEX srs_due_idx ON srs_cards(due);

-- Source of truth: encrypted/opaque CRDT snapshots + op log.
CREATE TABLE crdt_docs (
  note_id  TEXT PRIMARY KEY,
  snapshot BLOB NOT NULL,
  version  BLOB NOT NULL
);

-- Reserved for incremental op sync (ADR-008, v2). Not written in the v1 local
-- flow, which persists whole snapshots to crdt_docs.
CREATE TABLE crdt_oplog (
  seq      INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id  TEXT NOT NULL,
  "update" BLOB NOT NULL,
  ts       INTEGER NOT NULL
);
