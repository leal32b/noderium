import { ErrorBoundary } from 'solid-js'
import type { ParentComponent } from 'solid-js'

export const RootErrorBoundary: ParentComponent = (props) => (
  <ErrorBoundary
    fallback={(error, reset) => (
      <div class="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 class="text-lg font-semibold">Something went wrong</h1>
        <pre class="max-w-lg overflow-auto text-sm text-text-secondary">{String(error)}</pre>
        <button
          type="button"
          class="focus-ring rounded bg-action-primary-default px-3 py-2 text-action-primary-text"
          onClick={reset}
        >
          Reload
        </button>
      </div>
    )}
  >
    {props.children}
  </ErrorBoundary>
)
