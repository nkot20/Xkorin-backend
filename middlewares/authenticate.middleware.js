const passport = require('passport');
require('../config/passport.config')(passport);

const authenticate = passport.authenticate('jwt', { session: false });

module.exports = {authenticate};
