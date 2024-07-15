const NodeCache = require('node-cache');

// Créez une instance de NodeCache avec une TTL (Time To Live) de 3 jours (en secondes)
const cache = new NodeCache({ stdTTL: 3 * 24 * 60 * 60 });

const setCache = (key, value) => {
    return new Promise((resolve, reject) => {
        const success = cache.set(key, value);
        if (success) {
            resolve(true);
        } else {
            reject(new Error('Failed to set cache'));
        }
    });
};

const getCache = (key) => {
    return new Promise((resolve, reject) => {
        const value = cache.get(key);
        if (value) {
            resolve(value);
        } else {
            resolve(null);
        }
    });
};

const clearCache = () => {
    return new Promise((resolve, reject) => {
        const success = cache.flushAll();
        if (success) {
            resolve(true);
        } else {
            reject(new Error('Failed to clear cache'));
        }
    });
};


module.exports = { setCache, getCache, clearCache };
