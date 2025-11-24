var express = require('express');
var router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

async function getCompanies() {
  const [rows] = await pool.query(
    'SELECT id, name, score FROM companies ORDER BY score DESC'
  );
  return rows;
}

// Henter hjemmesiden
router.get('/', async (req, res) => {
  try {
    const companies = await getCompanies();

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      loggedIn: !!req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      title: 'Understory Toplist',
      companies: [],
      loggedIn: !!req.session.user,
    });
  }
});

// /understory-toplist – kun for innloggede (kan bruke samme view)
router.get('/understory-toplist', auth, async (req, res) => {
  try {
    const companies = await getCompanies();

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      loggedIn: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Noe gikk galt');
  }
});

module.exports = router;

//MÅ SE OVER Å GJØRE MINDRE CHAT