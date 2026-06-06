import * as v from 'valibot'

const EnvSchema = v.object({
  VITE_API_BASE_URL: v.optional(v.pipe(v.string(), v.url()), 'http://localhost'),
})

export type Env = v.InferOutput<typeof EnvSchema>

export const env: Env = v.parse(EnvSchema, import.meta.env)
