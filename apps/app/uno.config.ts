import presetIcons from '@unocss/preset-icons'
import { presetDaisy } from '@unscatty/unocss-preset-daisy'
import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetDaisy(),
    presetIcons()
  ],
  theme: {
    colors: {
      main: 'var(--color-bg-main)'
    }
  }
})
