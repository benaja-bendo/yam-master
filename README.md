# yamaster

## 🗂 Structure de projet recommandée

```shell
monorepo/
├── apps/
│   ├── frontend/         # React + TypeScript
│   └── backend/          # Express + tRPC + WebSockets + XState
├── packages/
│   ├── ui/               # Composants React partagés
│   ├── logic/            # Machines XState et logique partagée
│   └── types/            # Types partagés (type-safe inter-app)
├── tests/                # Tests d'intégration bout-en-bout (e2e)
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json    # Base config TypeScript
```
