import rateLimit from 'express-rate-limit';

// Pendant les tests, les limites sont désactivées
const skipInTests = () => process.env.NODE_ENV === 'test';

// Connexion : 10 tentatives échouées par IP toutes les 15 minutes
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true, // seules les tentatives échouées comptent
    skip: skipInTests,
    message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Inscription : 5 comptes par IP et par heure
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: skipInTests,
    message: { success: false, message: 'Too many accounts created. Please try again later.' },
});