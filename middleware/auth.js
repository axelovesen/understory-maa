function auth(req, res, next) {
  if (!req.session.userId && res.session.user) {
    return next();
  }
  return res.redirect('/');
}

module.exports = { auth };
