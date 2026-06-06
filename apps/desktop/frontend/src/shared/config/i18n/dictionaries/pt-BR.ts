import type enUS from './en-US'

const dict: typeof enUS = {
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
  },
  navigation: {
    home: 'Início',
    settings: 'Configurações',
  },
  app: {
    welcome: {
      title: 'Bem-vindo ao Noderium',
      subtitle: 'Capturar → destilar → reter. Seu segundo cérebro, local-first.',
    },
  },
  topbar: {
    toggleSidebar: 'Alternar barra lateral',
    theme: 'Tema',
    language: 'Idioma',
    openCommandPalette: 'Abrir paleta de comandos',
  },
  theme: {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
  },
  command: {
    placeholder: 'Digite um comando ou busque…',
    empty: 'Nenhum comando encontrado.',
    group: {
      navigate: 'Navegar',
      actions: 'Ações',
    },
    navigate: {
      home: 'Ir para Início',
      settings: 'Ir para Configurações',
    },
    actions: {
      toggleTheme: 'Alternar tema claro/escuro',
    },
  },
  notFound: {
    title: 'Página não encontrada',
    back: 'Voltar para Início',
  },
}

export default dict
