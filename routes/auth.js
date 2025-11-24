var express = require('express');
var router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Registrer (GET) – brukt hvis noen går direkte til /signup
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Registrer (POST) – brukt av fetch i login.js
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post og passord må fylles in' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post er allerede i Bruk' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hash]
    );

    return res.json({
      success: true,
      message: 'Bruker opprettet. Du kan logge inn.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Noe gikk galt under registreringen.',
    });
  }
});

// Login 
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login (POST)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'E-post og passord må fylles inn her' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post eller passord' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: 'Feil e-post eller passord' });
    }

    // lagre bruker i session
    req.session.user = { id: user.id, email: user.email };

    return res.json({
      success: true,
      redirect: '/understory-toplist',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Noe gikk galt under innloggingen.',
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;

//MÅ SE OVER Å GJØRE MINDRE CHAT