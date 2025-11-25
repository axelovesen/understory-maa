var express = require('express');
var router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

//henter hvilke KPI brukeren kan sortere etter

const SORT_COLUMNS = ['revenue', 'bookings', 'clicks', 'visits', 'score',];

async function getCompanies(sort) {
  let sortColumn = 'score'; //det den faller tilbakepå

  if (SORT_COLUMNS.includes(sort)) {
    sortColumn = sort;
  }

  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.logo_url,
      SUM(k.revenue) AS revenue,
      SUM(k.bookings) AS bookings,
      SUM(k.clicks) AS clicks,
      SUM(k.visits) AS visits,
      AVG(k.score) AS score
    FROM companies c
    JOIN kpis k ON c.id = k.company_id
    GROUP BY c.id
    ORDER BY ${sortColumn} DESC
    LIMIT 10`
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