# Backend YaMaster 🎮

## 🌟 Vue d'ensemble

Le backend de YaMaster est un serveur de jeu robuste et évolutif, conçu pour offrir une expérience de jeu fluide et réactive. Il s'appuie sur une architecture moderne combinant Express.js, WebSocket et XState pour gérer efficacement la logique de jeu, les connexions en temps réel et la gestion d'état.

### Points Forts 💪

- Architecture événementielle robuste avec XState
- Communication temps réel bidirectionnelle via WebSocket
- Support des modes PvP (Joueur vs Joueur) et PvB (Joueur vs Bot)
- API REST complète avec documentation détaillée
- Tests automatisés pour une qualité de code optimale

## 🛠 Stack Technique

- **Express.js**: Framework web minimaliste et performant
- **WebSocket**: Communication temps réel bidirectionnelle
- **XState**: Machines à états pour une gestion d'état prévisible
- **TypeScript**: Typage statique pour un code plus sûr et maintenable
- **Jest**: Framework de test pour garantir la qualité du code

## 🚀 Prérequis

- Node.js (v18 ou supérieur)
- pnpm (gestionnaire de paquets)
- Git (pour le contrôle de version)

## ⚙️ Installation et Configuration

1. **Installation des dépendances**

```bash
pnpm install
```

2. **Configuration de l'environnement**

Créez un fichier `.env` à la racine du projet :

```env
PORT=3000          # Port du serveur HTTP
WS_PORT=3001       # Port WebSocket
NODE_ENV=development
```

## 💻 Commandes de Développement

```bash
# Démarrage en mode développement avec hot-reload
pnpm dev

# Construction du projet
pnpm build

# Exécution des tests
pnpm test

# Vérification du style de code
pnpm lint
```

## 📚 API REST

### Gestion des Parties

#### 1. Création d'une Partie

```http
POST /api/games

# Corps de la requête
{
  "mode": "pvp" | "pvb",
  "botDifficulty": "easy" | "hard"  # Requis si mode=pvb
}

# Réponse
{
  "gameId": "uuid-v4",
  "state": {
    "value": "waiting",
    "context": { ... }
  }
}
```

#### 2. Rejoindre une Partie

```http
POST /api/games/:gameId/join

# Corps de la requête
{
  "playerId": "player2"
}
```

#### 3. État de la Partie

```http
GET /api/games/:gameId

# Réponse
{
  "state": "playing",
  "context": {
    "currentPlayer": "player1",
    "scores": { ... }
  }
}
```

## 🔌 Communication WebSocket

### Point d'Entrée

```shell
ws://<host>:<ws_port>/ws
```

### Événements Principaux

#### 1. Connexion à une Partie

```json
// Client → Serveur
{
  "type": "JOIN",
  "gameId": "uuid-v4",
  "playerId": "player1"
}

// Serveur → Client (Confirmation)
{
  "type": "STATE_INIT",
  "state": { ... }
}
```

#### 2. Actions de Jeu

```json
// Client → Serveur
{
  "type": "ROLL" | "KEEP" | "SCORE",
  "payload": {
    "diceIndexes": [0, 2],  // Pour KEEP
    "category": "ones"      // Pour SCORE
  }
}

// Serveur → Client (Mise à jour)
{
  "type": "STATE_UPDATE",
  "state": { ... }
}
```

## 🏗 Architecture du Projet

```shell
backend/
├── src/
│   ├── config/           # Configuration (env, cors, etc.)
│   ├── controllers/      # Contrôleurs HTTP et WebSocket
│   ├── models/           # Modèles de données et interfaces
│   ├── routes/           # Routes API REST
│   ├── services/         # Services métier
│   ├── websocket/        # Gestionnaire WebSocket
│   └── machines/         # Machines à états XState
├── tests/               # Tests unitaires et d'intégration
└── dist/               # Code compilé
```

## 🧪 Tests

Le projet utilise Jest pour les tests unitaires et d'intégration :

```bash
# Exécution de tous les tests
pnpm test

# Mode watch pour le développement
pnpm test:watch

# Couverture de code
pnpm test:coverage
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: Ajout d'une fonctionnalité'`)
4. Lancez les tests (`pnpm test`)
5. Push vers la branche (`git push origin feature/AmazingFeature`)
6. Ouvrez une Pull Request

### Convention de Commits

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `test:` Ajout ou modification de tests
- `refactor:` Refactoring du code

## 📝 License

Ce projet est sous licence ISC - voir le fichier [LICENSE](LICENSE) pour plus de détails.