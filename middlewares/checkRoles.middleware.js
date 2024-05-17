const roles = require('../config/role');
const responseHandler = require('../utils/responseHandler');

const checkRole = (roleNames) => (req, res, next) => {
  // Assurez-vous que l'utilisateur est connecté et a un rôle
  if (!req.user || !req.user.role) {
    return responseHandler.error(res, 401, 'Unauthorized');
  }
  const roleValues = roleNames.map((name) => roles[name]);
  // Vérifiez si l'utilisateur a le bon rôle
  if (!req.user.role.some((n) => roleValues.includes(n))) {
    return responseHandler.error(res, 403, 'Forbidden');
  }

  // Si tout est en ordre, passez au middleware suivant
  return next();
};

module.exports = checkRole;
