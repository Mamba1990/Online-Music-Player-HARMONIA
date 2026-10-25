import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// En local : charge le .env de la racine du projet.
// Dans Docker, ce fichier n'existe pas dans l'image : les variables viennent de docker-compose.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('Database Connection Error: MONGO_URI is not defined');
        process.exit(1);
    }

    // Évite une seconde connexion si une est déjà ouverte ou en cours
    if (mongoose.connection.readyState !== 0) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // échoue en 5 s si Mongo est injoignable
        });

        const { host, name } = mongoose.connection;
        console.log(`MongoDB Connected: ${host}/${name}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;