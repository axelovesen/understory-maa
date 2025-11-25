var express = require('express');
var router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

//henter hvilke KPI brukeren kan sortere etter

const sortColums = {
  revenue: 'revenue',
  bookings: 'bookings',
  clicks: 'clicks',
  visits: 'visits',
  score: 'score',
};

//bygger SQL etter periodene vi har valgt
function buildPeriod(period) {
  switch (period) {
    case '1M':
      return "period_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
    case '3M':
      return "period_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
    case '6M':
      return "period_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    case '12M':
      return "period_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)";
    default:
      return '1'; //ingen filter
  }
}

async function getCompanies(sort) {
  let sortColumn = 'score'; //det den faller tilbakepå

  if (sort === 'revenue') {
    sortColumn = 'revenue';
  } else if (sort === 'bookings') {
    sortColumn = 'bookings';
  } else if (sort === 'clicks') {
    sortColumn = 'clicks';
  } else if (sort === 'visits') {
    sortColumn = 'visits';
  }

  const [companies] = await pool.query(
    `SELECT c.id, c.name, c.logo_url,
      SUM(k.revenue) AS revenue,
      SUM(k.bookings) AS bookings,
      SUM(k.clicks) AS clicks,
      SUM(k.visits) AS visits,
      AVG(k.score) AS score
    FROM companies c
    ORDER BY ${sortColumn} DESC
    LIMIT 10`
  );
  return companies;
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

// /understory-toplist - kun for innloggede (kan bruke samme view)
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