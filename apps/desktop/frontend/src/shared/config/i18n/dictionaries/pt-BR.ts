import type enUS from './en-US'

const dict: typeof enUS = {
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
  },
  navigation: {
    section: 'Espaço',
    home: 'Início',
    journal: 'Diário',
    notes: 'Notas',
    review: 'Revisão',
    settings: 'Configurações',
    editor: 'Editor',
  },
  app: {
    welcome: {
      title: 'Bem-vindo ao Noderium',
      subtitle: 'Capturar → destilar → reter. Seu segundo cérebro, local-first.',
    },
  },
  home: {
    open: 'Abrir',
    journalDesc: 'Capture o dia com notas diárias sem fricção.',
    notesDesc: 'Destile ideias em notas atômicas e conectadas.',
    reviewDesc: 'Retenha o que importa com repetição espaçada.',
  },
  editor: {
    title: 'Editor de blocos (Spike #1)',
    subtitle: 'ProseMirror + Loro CRDT. Digite à vontade — o medidor mostra a latência por tecla.',
    saving: 'Salvando',
    saved: 'Salvo',
    saveError: 'Falha ao salvar',
    persist: 'Persistir no core',
    export: 'Exportar',
  },
  journal: {
    title: 'Diário',
  },
  notes: {
    title: 'Notas',
    new: 'Nova nota',
    untitled: 'Sem título',
    empty: 'Nenhuma nota ainda.',
    createError: 'Não foi possível criar a nota.',
  },
  review: {
    title: 'Revisão',
    subtitle: 'Cartões para hoje, agendados pelo FSRS.',
    empty: 'Nada para revisar. 🎉',
    add: 'Adicionar à revisão',
    added: 'Adicionado ✓',
    addError: 'Não foi possível adicionar',
    gradeError: 'Não foi possível salvar a revisão.',
    again: 'De novo',
    hard: 'Difícil',
    good: 'Bom',
    easy: 'Fácil',
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
    search: 'Buscar…',
  },
  theme: {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
  },
  settings: {
    title: 'Configurações',
    appearance: 'Aparência',
    appearanceDesc: 'Tema e densidade de exibição.',
    theme: 'Tema',
    density: 'Densidade',
    comfortable: 'Confortável',
    compact: 'Compacto',
    language: 'Idioma',
    languageDesc: 'Idioma da interface.',
  },
  command: {
    placeholder: 'Busque notas ou execute um comando…',
    empty: 'Nenhum resultado.',
    commandsLabel: 'Comandos',
    notesLabel: 'Notas',
    group: {
      navigate: 'Navegar',
      actions: 'Ações',
    },
    navigate: {
      home: 'Ir para Início',
      journal: 'Ir para Diário',
      notes: 'Ir para Notas',
      review: 'Ir para Revisão',
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
