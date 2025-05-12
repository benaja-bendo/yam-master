# YaMaster 🎮

[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange)](https://pnpm.io/workspaces)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-Frontend-61dafb)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-Backend-000000)](https://expressjs.com/)

Monorepo moderne pour une application web full-stack utilisant les dernières technologies JavaScript/TypeScript.

## 🚀 Technologies

- **Frontend**: React + TypeScript
- **Backend**: Express + WebSockets + XState
- **Gestion des États**: XState pour une gestion d'état robuste et prévisible
- **Type Safety**: TypeScript de bout en bout
- **Monorepo**: Gestion efficace avec pnpm workspaces

## 📦 Structure du Projet

```shell
.
├── apps/
│   ├── frontend/         # Application React + TypeScript
│   └── backend/          # Serveur Express + WebSockets + XState
├── packages/
│   ├── ui/              # Composants React partagés
│   ├── logic/           # Machines XState et logique partagée
│   └── types/           # Types partagés (type-safe inter-app)
├── tests/               # Tests d'intégration bout-en-bout (e2e)
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json   # Configuration TypeScript de base
```

## 🛠 Installation

1. Installez pnpm si ce n'est pas déjà fait :

```bash
npm install -g pnpm
```

2. Installez les dépendances :

```bash
pnpm install
```

## 🚧 Développement

1. Lancez le serveur de développement frontend :

```bash
pnpm --filter frontend dev
```

2. Lancez le serveur backend :

```bash
pnpm --filter backend dev
```

## 🔍 Commandes Utiles

Pour afficher la structure du projet (ignorant les dossiers non essentiels) :

```bash
tree -I 'node_modules|.git|dist|build|coverage' --dirsfirst
```

Ou créez un alias pratique :
```bash
alias project-tree="tree -I 'node_modules|.git|dist|build|coverage' --dirsfirst"
```

## 📝 License

ISC
