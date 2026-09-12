const authService = require('./auth.service');
const verificationService = require('./verification.service');
const googleService = require('./google.service');

module.exports = {
  ...authService,
  ...verificationService,
  ...googleService
};
