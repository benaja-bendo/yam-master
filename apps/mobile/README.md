# YAMaster Mobile

## Description

Application mobile React Native pour YAMaster, intégrée dans le monorepo avec une configuration compatible avec les autres applications.

## Configuration

L'application mobile est configurée pour partager les packages communs avec le reste du monorepo :

- Utilise les mêmes versions de React que le frontend (^19.1.0)
- Partage les packages `@yamaster/logic` et `@yamaster/types`
- Configuration TypeScript alignée avec le reste du projet

## Démarrage

```bash
# Installer les dépendances (à la racine du monorepo)
pnpm install

# Démarrer l'application mobile
pnpm dev:mobile

# Ou directement depuis le dossier mobile
cd apps/mobile
pnpm start
```

## Développement

### Structure des dossiers

```
apps/mobile/
├── app/            # Fichiers de l'application (utilisant expo-router)
├── assets/         # Images, polices et autres ressources
├── components/     # Composants réutilisables
├── hooks/          # Hooks personnalisés
├── services/       # Services et API
└── utils/          # Fonctions utilitaires
```

### Commandes disponibles

- `pnpm start` : Démarre le serveur de développement Expo
- `pnpm android` : Lance l'application sur un émulateur/appareil Android
- `pnpm ios` : Lance l'application sur un simulateur/appareil iOS
- `pnpm web` : Lance l'application en mode web
- `pnpm lint` : Exécute le linter
- `pnpm build` : Construit l'application pour la production (nécessite une configuration EAS)

## Partage de code

Pour utiliser le code partagé des packages communs :

```javascript
// Importer depuis les packages partagés
import { someFunction } from '@yamaster/logic';
import type { SomeType } from '@yamaster/types';
```