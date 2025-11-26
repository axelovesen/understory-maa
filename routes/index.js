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


//dum data for sikkerhet fordi bare blur holder ikke da man kan inspiserere uten css
const DUMMY_COMPANIES = [
  { id: 1, name: 'Firma A', revenue: 100000, bookings: 5000, clicks: 20000, visits: 15000, score: 85 },
  { id: 2, name: 'Firma B', revenue: 80000, bookings: 3000, clicks: 15000, visits: 12000, score: 78 },
  { id: 3, name: 'Firma C', revenue: 120000, bookings: 7000, clicks: 25000, visits: 18000, score: 90 },
  { id: 4, name: 'Firma D', revenue: 60000, bookings: 2000, clicks: 10000, visits: 8000, score: 70 },
];

function sortDummy(list, sort){
  const sortColumn = SORT_COLUMNS[sort] || 'score';
  return list.sort((a, b) => b[sortColumn] - a[sortColumn]);
}

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
  const sort = req.query.sort || 'score';
    const period = req.query.period || '1Y';
    const loggedIn = !!req.session.user;

    try {
    let companies;
    let isDummy = false;

    if (!loggedIn){
    companies = sortDummy(DUMMY_COMPANIES, sort);
    isDummy = true;
    
    } else{
    companies = await getCompanies(sort, period);
  }
    res.render('index', {
      title: 'Understory Toplist',
      companies,
      sort,
      period,
      loggedIn,
      isDummy,
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      title: 'Understory Toplist',
      companies: [],
      sort,
      period,
      loggedIn,
      isDummy: !loggedIn,
    });
  }
});

/*
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

// /understory-toplist - om oss
router.get('/understory-toplist', async (req, res) => {

});
*/

module.exports = router;