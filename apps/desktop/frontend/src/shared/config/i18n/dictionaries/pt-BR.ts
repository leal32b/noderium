import type enUS from './en-US'

const dict: typeof enUS = {
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
  },
  navigation: {
    home: 'Início',
    journal: 'Diário',
    notes: 'Notas',
    settings: 'Configurações',
    editor: 'Editor',
  },
  app: {
    welcome: {
      title: 'Bem-vindo ao Noderium',
      subtitle: 'Capturar → destilar → reter. Seu segundo cérebro, local-first.',
    },
  },
  editor: {
    title: 'Editor de blocos (Spike #1)',
    subtitle: 'ProseMirror + Loro CRDT. Digite à vontade — o medidor mostra a latência por tecla.',
    saving: 'Salvando…',
    saved: 'Salvo ✓',
  },
  journal: {
    title: 'Diário',
  },
  notes: {
    title: 'Notas',
    new: 'Nova nota',
    untitled: 'Sem título',
    empty: 'Nenhuma nota ainda.',
  },
  search: {
    title: 'Busca',
    placeholder: 'Busque nas suas notas…',
    run: 'Buscar',
    matches: 'resultados',
  },
  backlinks: {
    title: 'Backlinks',
    empty: 'Nenhum backlink ainda.',
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
      journal: 'Ir para Diário',
      notes: 'Ir para Notas',
      settings: 'Ir para Configurações',
      editor: 'Ir para Editor',
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
