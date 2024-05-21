const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

module.exports = function () {
  return function (req, res, next) {
    try {
      if (req.headers.authorization == undefined || req.headers.authorization == 'undefined') {
        res.status(404).json({ succeess: false, data: [], message: 'Please Enter Token' });
      }

      const decoded = jwt.verify(req.headers.authorization, config.secret);
      console.log(decoded);
      req.user = decoded;
      console.log('request user ', req.user);
      next();
    } catch (error) {
      console.log('<<<<<Token Invalid Error<<<<<', error);
      res.status(401).json({ succeess: false, data: [], message: 'Token is not valid' });
    }
  };
};
