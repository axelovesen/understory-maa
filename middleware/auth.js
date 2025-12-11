module.exports = function (req, res, next) {
  //hvis bruker er logget inn (vi har satt req.session.user i auth.js etter 2FA
  if (req.session && req.session.user) {
    return next();
  }

  //hvis ikke logget inn,send så til forsiden (der login-modal finnes)
  return res.redirect('/');
};