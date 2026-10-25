import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// En local : charge le .env de la racine du projet.
// Dans Docker, les variables viennent de docker-compose et ce fichier est ignoré.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

const PORT = process.env.PORT || 4000;

// On attend la connexion à la base avant d'ouvrir le port
await connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});