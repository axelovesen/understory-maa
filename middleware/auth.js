/*function auth(req, res, next) {
  if (!req.session.userId && res.session.user) {
    return next();
  }
  return res.redirect('/');
}

module.exports = { auth };
*/

// middleware/auth.js

module.exports = function (req, res, next) {
  // Hvis bruker er logget inn (vi har satt req.session.user i auth.js etter 2FA)
  if (req.session && req.session.user) {
    return next();
  }

  // Hvis ikke logget inn → send til forsiden (der login-modal finnes)
  return res.redirect('/');
};