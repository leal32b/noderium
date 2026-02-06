import presetIcons from '@unocss/preset-icons'
import { presetDaisy } from '@unscatty/unocss-preset-daisy'
import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetDaisy({
      // DaisyUI configuration
      // Available themes: light, dark, cupcake, bumblebee, emerald, corporate,
      // synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua,
      // lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn,
      // business, acid, lemonade, night, coffee, winter, dim, nord, sunset, etc.
      themes: ['light', 'dark'] // Enable only the themes you need
      // darkTheme: 'dark', // Default theme for dark mode
      // base: true, // Apply base styles
      // styled: true, // Apply styles to components
      // utils: true, // Add utility classes
      // prefix: '' // Prefix for classes (ex: 'daisy-')
    }),
    presetIcons()
  ],
  theme: {
    colors: { }
  }
})
