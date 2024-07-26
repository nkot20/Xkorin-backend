const logger = require('../logger');

const errorHandler = (err, req, res, next) => {
    // Log l'erreur
    logger.error(err.message, err);

    // Détermine le type de réponse basé sur le type d'erreur
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

module.exports = errorHandler;