/** Shared cross-cutting types. Domain types live in their entities. */

export type Nullable<T> = T | null

export interface Disposable {
  dispose: () => void
}
