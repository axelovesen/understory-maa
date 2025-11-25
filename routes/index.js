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

function buildPeriodCondition(period) {
  switch (period) {
    case '1M':
      return "k.period_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
    case '3M':
      return "k.period_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
    case '6M':
      return "k.period_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    case '1Y':
    default:
      return "1=1";
  }
}

async function getCompanies(sort = 'score', period = '1Y') {
  const sortColumn = SORT_COLUMNS[sort] || 'score';
  const periodCondition = buildPeriodCondition(period);
  
  const [rows] = await pool.query(
    `SELECT c.id, c.name,
      SUM(k.revenue) AS revenue,
      SUM(k.bookings) AS bookings,
      SUM(k.clicks) AS clicks,
      SUM(k.visits) AS visits,
      AVG(k.score) AS score
    FROM companies c
    JOIN kpis k ON c.id = k.company_id
    WHERE ${periodCondition}
    GROUP BY c.id
    ORDER BY ${sortColumn} DESC`
  );
  return rows;
}

// Henter hjemmesiden
router.get('/', async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const period = req.query.period || '1Y';
    const companies = await getCompanies(sort, period);

    res.render('index', {
      title: 'Understory Toplist',
      companies,
      sort,
      period,
      loggedIn: !!req.session.user,
    });
  } catch (error) {
    console.error(error);
    const sort = req.query.sort || 'score';
    const period = req.query.period || '1Y';

    res.render('index', {
      title: 'Understory Toplist',
      companies: [],
      sort,
      period,
      loggedIn: !!req.session.user,
    });
  }
});

// /understory-toplist - kun for innloggede (kan bruke samme view)
router.get('/understory-toplist', auth, async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const period = req.query.period || '1Y';
    const companies = await getCompanies(sort, period);

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