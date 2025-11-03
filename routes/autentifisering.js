// routes/auth.js
var express = require('express');
var bcrypt = require('bcrypt');
var { body, validationResult } = require('express-validator');
var router = express.Router();

var users = []; // {id, email, hash}

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, email, hash };
    users.push(user);
    req.session.user = { id: user.id, email: user.email };
    res.json({ ok: true });
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.user = { id: user.id, email: user.email };
    res.json({ ok: true });
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

module.exports = router;