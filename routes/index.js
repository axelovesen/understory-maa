var express = require('express');
var router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

async function getCompanies() {
  const [rows] = await pool.query('SELECT id, name, score FROM companies ORDER BY score DESC'
  );
  return rows;
}

//henter hjemmesiden
router.get('/', async (req, res) => {
  try {
    const companies = await getCompanies();

    const loggedIn = !!(req.session && req.session.userId);

    res.render('index', { title: 'Understory Toplist', companies 
    });
  } catch (error) {
    console.error(error);

    const loggedIn = !!(req.session && req.session.userId);

    res.render('index', {
      title: 'Understory Toplist',
      companies: [],
    });
  }
});

//GET understory toplist siden, bare synlig hvis logget inn
router.get('/understory-toplist', auth, async (req, res) => {
  try {
    const companies = await getCompanies();
    res.render('understory-toplist', { title: 'Understory Toplist', companies
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Noe gikk galt");
  }
});

module.exports = router;