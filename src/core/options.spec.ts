// this file had to be moved to avoid tsup from picking it up
import { describe, expect, it } from 'vitest'
import { mockWarn } from '../../tests/vitest-mock-warn'
import { resolveOptions } from '../options'

describe('options', () => {
  mockWarn()
  it('ensure starting dots in extensions', () => {
    expect(
      resolveOptions({
        extensions: ['vue', '.ts'],
      }),
    ).toMatchObject({
      extensions: ['.vue', '.ts'],
    })

    expect('Invalid extension "vue"').toHaveBeenWarned()
  })
})
