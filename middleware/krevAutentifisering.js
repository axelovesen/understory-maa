// middleware/requireAuth.js
function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Login required' });
  return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}
module.exports = { requireAuth };