var express = require('express');
var router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

//Registrer (GET)
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

//Registrer (POST)
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!email || !password) {
      return res.render('signup', { error: 'E-post og passord må fylles inn.' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.render('signup', { error: 'E-post er allerede i bruk.' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.render('signup', { error: 'Noe gikk galt under registreringen.' });
  }
});

//login (GET)
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

//Login (POST)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.render('login', { error: 'Feil e-post eller passord' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { error: 'Feil e-post eller passord' });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };

    res.redirect('/understory-toplist');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Noe gikk galt under innloggingen' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;