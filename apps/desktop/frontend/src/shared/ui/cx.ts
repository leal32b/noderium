type ClassValue = string | false | null | undefined

/** Tiny className combiner (clsx-lite) for composing UnoCSS utilities. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
