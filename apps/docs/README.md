# Noderium Documentation

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
pnpm install
```

## Local Development

```bash
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Running from Monorepo Root

You can also run the documentation site from the root of the monorepo:

```bash
# From the root directory
pnpm dev:docs   # Start development server
pnpm build:docs # Build for production
```
