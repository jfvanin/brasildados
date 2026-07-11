# Dashboard - Dados do Brasil

Este é um dashboard interativo desenvolvido em Next.js, React, TypeScript e Tailwind CSS para visualização de dados econômicos, sociais e ambientais do Brasil. O conteúdo e as tabelas são renderizados no servidor, com páginas indexáveis para cada indicador.

## 🚀 Características

- **Visualizações Interativas**: Gráficos de linha com toggles para habilitar/desabilitar indicadores
- **Timeline Presidencial**: Linha do tempo com presidentes e partidos, colorizada por partido político
- **Dados Abrangentes**: 5 categorias de indicadores:
  - Indicadores Econômicos Principais
  - Dados Financeiros
  - Desenvolvimento Humano
  - Meio Ambiente
  - Outros Indicadores
  - Mais a ser adicionado

## 🛠️ Tecnologias

- **Next.js (App Router)** - SSR, rotas de indicadores e SEO
- **React 18** - Interface interativa
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Recharts** - Biblioteca de gráficos

## 🎨 Design

- **Cores**: Azul-marinho de fundo com tons de verde e amarelo (cores do Brasil)
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Interatividade**: Toggles para controlar visualização dos dados
- **Timeline**: Representação visual dos períodos presidenciais

## 📊 Funcionalidades

### Gráficos Interativos

- Cada gráfico possui toggles na parte superior para habilitar/desabilitar indicadores
- Tooltips mostram informações detalhadas incluindo o presidente no período
- Cores dos dados variam conforme o partido político do presidente

### Fontes dos Dados

- Seção no final da página listando todas as fontes dos dados
- Sem repetições, organizadas alfabeticamente

## 🚀 Como executar

1. **Instalar dependências:**

```bash
npm install
```

2. **Executar em modo de desenvolvimento:**

```bash
npm run dev
```

3. **Compilar para produção:**

```bash
npm run build
```

## 🗄️ Fonte dos Dados

Os dados são carregados do arquivo `dados_brasil.json` que contém informações históricas do Brasil com as seguintes fontes:

- Human Development Report (UNDP)
- World Bank
- Outras fontes governamentais e internacionais

## 🎯 Características Técnicas

- **Interface de Backend Simulada**: Estruturado como se houvesse um backend, usando service pattern
- **Tipagem Completa**: TypeScript para maior segurança e manutenibilidade
- **Componentização**: Componentes reutilizáveis e bem organizados
- **Responsividade**: Design mobile-first com Tailwind CSS
- **Performance**: Uso de useMemo para otimização de cálculos pesados
