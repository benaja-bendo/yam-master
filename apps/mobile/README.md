# Mobile YaMaster 🎮

## 🌟 Vue d'ensemble

L'application mobile de YaMaster, développée avec React Native et Expo, permet une expérience de jeu portable sur Android et iOS. Elle offre une interface fluide, rapide et cohérente avec la version web.

### Points Forts 💪

- Déploiement facile avec Expo
- Support Android et iOS
- Typage complet avec TypeScript
- Navigation fluide avec React Navigation
- Composants réutilisables
- Tests unitaires avec Jest et Testing Library

## 🛠 Stack Technique

- **React Native** : Framework mobile
- **Expo** : Outils et services pour React Native
- **TypeScript** : Typage statique
- **React Navigation** : Gestion de la navigation
- **Jest** : Framework de test

## 🚀 Prérequis

- Node.js (v18 ou supérieur)
- pnpm
- Git
- Expo CLI :

```bash
npm install -g expo-cli
```

## ⚙️ Installation et Lancement

```bash
pnpm install
cd apps/mobile
pnpm start
```

## 📱 Commandes

```bash
# Démarrage avec Expo
pnpm start

# Tests unitaires
pnpm test

# Linter
pnpm lint
```

## 🏗 Architecture du Projet

```shell
apps/mobile/
├── app/             # Écrans (screens) avec Expo Router ou navigation classique
├── components/      # Composants partagés
├── assets/          # Images, sons, etc.
├── hooks/           # Hooks personnalisés
└── stores/          # Gestion d’état
```

## 🧪 Tests

```bash
pnpm test           # Exécution des tests avec Jest
pnpm test:watch     # Mode watch
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/NouvelleFonction`)
3. Ajoutez votre code
4. Testez (`pnpm test`)
5. Poussez vos modifications (`git push`)
6. Créez une Pull Request

## 📝 Licence

Ce projet est sous licence ISC - voir le fichier [LICENSE](LICENSE) pour plus d’informations.
