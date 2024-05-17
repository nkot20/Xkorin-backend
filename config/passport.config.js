const passportJWT = require('passport-jwt');

const JwtStrategy = passportJWT.Strategy;
const { ExtractJwt } = passportJWT;

const config = require('dotenv').config();

const User = require('../models/User');

module.exports = (passport) => {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.parsed.JWT_SECRET,
  };

  passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
    User.findById(payload.sub, (err, user) => {
      if (err) {
        return done(err, false);
      }

      if (user) {
        return done(null, user.toJSON());
      }
      return done(null, false);
    });
  }));
};
