import presetIcons from '@unocss/preset-icons'
import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3(), presetIcons()],
  theme: {
    colors: {
      main: 'var(--color-bg-main)'
    }
  }
})
