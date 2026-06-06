# Editor Spike #1 — Latency validation

> **Status: ✅ PASS.** ProseMirror + `loro-prosemirror` meets the < 16 ms
> per-keystroke budget with large margin. ADR-004's editor risk is de-risked;
> proceed to integrate the editor into the app.

This is the #1 technical risk in the project (ADR-004 / ARCHITECTURE.md §12): if the
ProseMirror + Loro binding could not type at 60fps (< 16.67 ms/frame), the editor
engine choice would need to be reassessed.

## Findings

- **Device:** Apple M1 (arm64), macOS. Node 22, jsdom DOM, Loro WASM.
- **Setup:** 100 paragraph blocks in a Loro tree (via `loro-prosemirror`'s
  `LoroSyncPlugin`), typing 100 characters into **block #50**.
- **Measured** (apply transaction → Loro sync → DOM patch, per keystroke):

  | Run | avg | p95 | max |
  |-----|-----|-----|-----|
  | 1 | 0.484 ms | 0.816 ms | 3.435 ms |
  | 2 | 0.520 ms | 1.052 ms | 4.970 ms |
  | 3 | 0.502 ms | 0.946 ms | 3.586 ms |
  | 4 | 0.493 ms | 0.783 ms | 4.046 ms |

- **Conclusion: PASS.** p95 ≈ **0.8–1.1 ms**, ~15–20× under the 16 ms budget.
  Even worst-case single keystrokes (~5 ms) stay within budget.

### Caveat on the measurement

The test runs under **jsdom**, so it captures the **compute** cost (ProseMirror
transaction apply + `loro-prosemirror` sync + virtual DOM patch) but **not real
browser layout/paint**. That is the right thing to isolate here: the open question
was whether the *Loro binding* adds prohibitive per-keystroke overhead, and it does
not. Real-device paint will add some milliseconds but the binding leaves ~15 ms of
headroom. A browser-based RUM check belongs in the CI perf-budget job later.

## Code structure

- `src/schema.ts` — ProseMirror schema: block nodes (`paragraph`, `heading`,
  `blockquote`, `code_block`, lists, `list_item`) with `id`/`blockType` block
  attributes; marks (`strong`, `em`, `code`, `link`).
- `src/loro-binding.ts` — wires PM ↔ Loro via `LoroSyncPlugin` + `LoroUndoPlugin`
  (the live Loro doc lives in JS/WASM, ADR-005); instruments `dispatchTransaction`
  to measure per-keystroke latency. Helpers: `seedParagraphs`, `positionInsideBlock`.
- `src/ProseMirrorEditor.tsx` — Solid component: editor pane + live latency meter.
- `src/latency-test.test.ts` — the spike: 100 blocks, 100 keystrokes in block #50,
  asserts **p95 < 16 ms**.

## Run it

```sh
just test-editor                      # fails the build if p95 > 16ms
pnpm --filter @noderium/editor test   # same, directly
```

## Next steps (on PASS)

- Promote the binding into a reusable `useLoroEditor` hook for the app.
- Integrate into `app-core` (Rust FFI) — flush Loro deltas to the store/index.
- Re-measure with sqlite-vec indexing running concurrently (no latency regression).
- Add a browser-based latency RUM check to the CI perf-budget job.

## If it had failed

- Fallback: CodeMirror 6 for a markdown source mode (already a demoted option in
  ADR-004), or investigate the bottleneck (GC, update batching, render cost).
- Escalate to product before committing further to the editor engine.
