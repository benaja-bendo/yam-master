import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export const serverConfig = {
  port: process.env.PORT || 3000,
  // Ajouter d'autres configurations serveur ici
};