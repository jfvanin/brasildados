# Dashboard - Dados do Brasil

Este é um dashboard interativo desenvolvido em Next.js com React, TypeScript e Tailwind CSS para visualização de dados econômicos, sociais e ambientais do Brasil.

## 🚀 Características

- **Visualizações Interativas**: gráficos de linha com controles para habilitar ou desabilitar indicadores
- **Renderização no Servidor**: conteúdo e tabelas disponíveis no HTML para melhorar SEO
- **Timeline Presidencial**: linha do tempo com presidentes e partidos
- **Páginas de Indicadores**: páginas individuais com descrição, fonte, tabela histórica e download CSV
- **Dados Abrangentes**: 5 categorias de indicadores:
  - Indicadores Econômicos Principais
  - Desenvolvimento Humano
  - Meio Ambiente
  - Dados Financeiros
  - Outros Indicadores

## 🛠️ Tecnologias

- **Next.js** - App Router e renderização no servidor
- **React** - interface interativa
- **TypeScript** - tipagem estática
- **Tailwind CSS** - estilização
- **Recharts** - gráficos

## 🎨 Design

- **Cores**: azul-marinho com tons de verde e amarelo
- **Responsividade**: adaptação para diferentes tamanhos de tela
- **Interatividade**: controles para selecionar indicadores e períodos
- **Timeline**: representação visual dos períodos presidenciais

## 📊 Funcionalidades

### Gráficos Interativos

- Controles para habilitar ou desabilitar indicadores
- Tooltips com dados detalhados e informações presidenciais
- Escalas linear e logarítmica
- Eventos históricos e explicações sobre cada indicador
- Exportação dos gráficos

### Fontes dos Dados

- Fontes exibidas em cada gráfico e nas páginas dos indicadores
- Seção final com todas as fontes utilizadas

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

4. **Executar o build de produção:**

```bash
npm start
```

Para gerar e testar o Worker da Cloudflare:

```bash
npm run preview
```

O deploy usa o adaptador OpenNext e as configurações de `wrangler.jsonc`.

## 🗄️ Fonte dos Dados

Os dados são carregados do arquivo `src/dados_brasil.json`, que contém valores históricos, fontes, informações presidenciais e descrições dos indicadores.

As principais fontes incluem:

- Human Development Report (UNDP)
- Banco Mundial
- IBGE
- Banco Central
- INPE
- Outras fontes governamentais e internacionais

## 🎯 Características Técnicas

- **Next.js App Router**: página principal com SSR e páginas individuais de indicadores
- **Componentização**: componentes reutilizáveis e interativos
- **Tipagem**: TypeScript para maior segurança e manutenção
- **Responsividade**: design mobile-first com Tailwind CSS
- **SEO**: metadata, dados estruturados, sitemap, robots e conteúdo histórico em HTML
