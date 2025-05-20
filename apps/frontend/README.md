# Frontend YaMaster 🎮

## 🌟 Vue d'ensemble

Le frontend de YaMaster est une application web rapide, interactive et moderne développée avec React, TypeScript et Vite. Il permet une expérience utilisateur fluide avec une interface responsive et intuitive.

### Points Forts 💪

- Interface moderne avec React + Vite
- Typage fort grâce à TypeScript
- UI responsive avec Tailwind CSS
- Routage dynamique avec React Router
- Gestion d’état centralisée (Zustand, Redux, etc.)
- Tests unitaires avec Vitest / Testing Library

## 🛠 Stack Technique

- **React** : Bibliothèque UI
- **Vite** : Dev server et bundler moderne
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **React Router** : Gestion du routage

## 🚀 Prérequis

- Node.js (v18 ou supérieur)
- pnpm (gestionnaire de paquets)
- Git

## ⚙️ Installation et Lancement

```bash
pnpm install
cd apps/frontend
pnpm dev
```

## 💻 Commandes de Développement

```bash
# Démarrage en mode développement
pnpm dev

# Construction de l’application
pnpm build

# Tests unitaires
pnpm test

# Linter
pnpm lint
```

## 🏗 Architecture du Projet

```shell
apps/web/
├── src/
│   ├── components/    # Composants réutilisables
│   ├── pages/         # Pages principales
│   ├── routes/        # Définition des routes
│   ├── hooks/         # Hooks personnalisés
│   └── stores/        # Zustand / Redux
└── public/            # Fichiers statiques
```

## 🧪 Tests

```bash
pnpm test       # Exécution des tests
pnpm test:watch # Mode watch
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/NouvelleFonction`)
3. Committez (`git commit -m 'feat: Ajout d’une fonction'`)
4. Poussez (`git push origin feature/NouvelleFonction`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence ISC - voir le fichier [LICENSE](LICENSE) pour plus d'informations.
