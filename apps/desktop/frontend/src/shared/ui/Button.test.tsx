import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders its label', () => {
    const { getByRole } = render(() => <Button>Click me</Button>)
    expect(getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies the primary variant by default', () => {
    const { getByRole } = render(() => <Button>Go</Button>)
    expect(getByRole('button').className).toContain('bg-accent')
  })
})
