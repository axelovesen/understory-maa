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

const PERIODS = {
  '1M':0.25,
  '3M':0.5,
  '6M':0.75,
  '12M':1,
};

async function getCompanies(sort = 'score', period = '12M') {
  const sortColumn = SORT_COLUMNS[sort] || 'score';
  const periodFactor = PERIODS[period] || 1;

  const [rows] = await pool.query(
    `SELECT id, name, revenue, bookings, clicks, visits, 
    score FROM companies ORDER BY ${sortColumn} DESC LIMIT 10`
  );
  // Juster score basert på periode
  const companies = rows.map(company => {
    const revenueNumber = Number(company.revenue)
    return {
      ...company,
      score: Math.round(company.score * periodFactor * 100) / 100,
      revenue: isNaN(revenueNumber) ? company.revenue : Math.round(revenueNumber * periodFactor * 100) / 100,
      bookings: Math.round(company.bookings * periodFactor * 100) / 100,
      clicks: Math.round(company.clicks * periodFactor * 100) / 100,
      visits: Math.round(company.visits * periodFactor * 100) / 100,
    };
  });
  return companies;
}

// Henter hjemmesiden
router.get('/', async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const period = req.query.period || '12M';
    const companies = await getCompanies(sort);

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      sort,
      period,
      loggedIn: !!req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      title: 'Understory Toplist',
      companies: [],
      sort: req.query.sort || 'score',
      period: req.query.period || '12M',
      loggedIn: !!req.session.user,
    });
  }
});

// /understory-toplist - kun for innloggede (kan bruke samme view)
router.get('/understory-toplist', auth, async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const period = req.query.period || '12M';
    const companies = await getCompanies(sort);

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      sort,
      period,
      loggedIn: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Noe gikk galt');
  }
});

module.exports = router;