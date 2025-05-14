# Backend YaMaster 🎮

## 📝 Description

Le backend de YaMaster est construit avec Express.js, WebSocket et XState pour fournir une architecture robuste et évolutive. Il gère la logique métier, les connexions en temps réel et la gestion d'état du jeu.

## 🛠 Technologies Principales

- **Express.js**: Framework web rapide et minimaliste
- **WebSocket**: Communication bidirectionnelle en temps réel
- **XState**: Gestion d'état prévisible avec machines à états
- **TypeScript**: Typage statique pour un code plus sûr

## 🚀 Prérequis

- Node.js (v18 ou supérieur)
- pnpm (gestionnaire de paquets)

## ⚙️ Installation

```bash
# Installation des dépendances
pnpm install
```

## 🔧 Configuration

1. Créez un fichier `.env` à la racine du dossier backend :

```env
PORT=3000
WS_PORT=3001
NODE_ENV=development
```

## 💻 Commandes de Développement

```bash
# Démarrer le serveur en mode développement
pnpm dev

# Construire le projet
pnpm build

# Lancer les tests
pnpm test

# Lancer le linter
pnpm lint
```

## 📚 API Routes

- `GET /api/health`: Vérification de l'état du serveur
- `GET /api/games`: Liste des parties disponibles
- `POST /api/games`: Créer une nouvelle partie
- `GET /api/games/:id`: Détails d'une partie spécifique

## 🔌 WebSocket Events

- `connection`: Établissement de la connexion WebSocket
- `join_game`: Rejoindre une partie
- `make_move`: Effectuer un mouvement
- `game_update`: Mise à jour de l'état du jeu
- `game_over`: Fin de partie

## 🏗 Architecture

```
backend/
├── src/
│   ├── config/        # Configuration de l'application
│   ├── controllers/   # Contrôleurs HTTP
│   ├── models/        # Modèles de données
│   ├── routes/        # Routes API
│   ├── services/      # Services métier
│   ├── websocket/     # Gestionnaire WebSocket
│   └── machines/      # Machines à états XState
├── tests/            # Tests unitaires et d'intégration
└── dist/            # Code compilé
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

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

ISC