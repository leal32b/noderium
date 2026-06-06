import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import type { ParentComponent } from 'solid-js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

export const QueryProvider: ParentComponent = (props) => (
  <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
)
