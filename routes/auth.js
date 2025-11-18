const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const users = []; // Dette er en midlertidig lagring, bytt ut med database i produksjon

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const alleredeOpprettet = await req.db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (alleredeOpprettet.length > 0) {
    return res.status(400).json({ message: 'Bruker med denne e-posten finnes allerede.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const resultat = await req.db.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword]
  );
  res.json({ 
    message: 'Bruker registrert.',
    userId: resultat.insertId });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const rows = await req.db.query(
    'SELECT id, password FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(400).json({ message: 'Ugyldig e-post eller passord.' });
  }

  const user = rows[0];

  const passordMatch = await bcrypt.compare(password, user.password);
  if (!passordMatch) {
    return res.status(400).json({ message: 'Ugyldig e-post eller passord.' });
  }

  req.session.userId = user.id;
  res.json({ message: 'Inlogget.' });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Utlogget.' });
});

module.exports = router;