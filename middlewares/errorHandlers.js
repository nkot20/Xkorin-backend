// Middleware pour capturer et traiter toutes les erreurs
function errorHandler(err, req, res, next) {
    console.error(err.stack); // Affiche l'erreur dans la console

    const status = err.status || 500; // Utilisation du statut d'erreur personnalisé, sinon 500 par défaut

    // Envoyer une réponse d'erreur appropriée au client avec des informations détaillées sur l'erreur
    res.status(status).json({ error: err.message || 'Une erreur est survenue sur le serveur.', stack: err.stack });
}

// Middleware pour gérer les erreurs asynchrones
function asyncErrorHandler(fn) {
    return function(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Middleware pour gérer les routes inconnues
function notFoundHandler(req, res, next) {
    const err = new Error('Route non trouvée.');
    err.status = 404;
    next(err);
}

module.exports = {
    errorHandler,
    asyncErrorHandler,
    notFoundHandler
};
