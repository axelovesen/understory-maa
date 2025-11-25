var express = require('express');
var router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

//henter hvilke KPI brukeren kan sortere etter

const SORT_COLUMNS = {
  revenue: 'revenue', 
  bookings: 'bookings', 
  clicks: 'clicks', 
  visits: 'visits', 
  score: 'score',};

async function getCompanies(sort = 'score') {
  const sortColumn = SORT_COLUMNS[sort] || 'score';

  const [rows] = await pool.query(
    `SELECT id, name, revenue, bookings, clicks, visits, 
    score FROM companies ORDER BY ${sortColumn} DESC LIMIT 10`
  );
  return rows;
}

// Henter hjemmesiden
router.get('/', async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const companies = await getCompanies(sort);

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      sort,
      period: null,
      loggedIn: !!req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      title: 'Understory Toplist',
      companies: [],
      sort: 'score',
      period: null,
      loggedIn: !!req.session.user,
    });
  }
});

// /understory-toplist - kun for innloggede (kan bruke samme view)
router.get('/understory-toplist', auth, async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const companies = await getCompanies();

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      sort,
      period: null,
      loggedIn: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Noe gikk galt');
  }
});

module.exports = router;