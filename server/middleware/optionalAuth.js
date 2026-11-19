import jwt from 'jsonwebtoken';

// Identifie l'utilisateur s'il envoie un token valide, sans jamais bloquer la requête.
// Sert aux routes publiques dont la réponse dépend de qui regarde (playlists privées).
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET, {
                audience: 'HARMONIA',
                issuer: 'Hafsa Daoudim',
            });
        } catch {
            // Token invalide ou expiré : on continue comme un visiteur
        }
    }
    next();
};

export default optionalAuth;
