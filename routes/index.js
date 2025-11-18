var express = require('express');
var router = express.Router();
const pool = require('../db');

async function getCompanies() {
  const [rows] = await pool.query('SELECT id, name, score FROM companies ORDER BY score DESC');
  return rows;
}

//henter hjemmesiden
router.get('/', async function(req, res) {
  try {
    const loggedIn = false; //starter med å ha den false, endres senere når vi bytter til session-check / kan evt endres nå
    const companies = await getCompanies();
    res.render('index', { title: 'Understory Toplist', companies, loggedIn 

    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Axel er en bæsj");
  }
});

//GET understory toplist siden, bare synlig hvis logget inn
router.get('/understory-toplist', async function(req, res) {
  try {
    const loggedIn = true; //midltertidig løsning før session/cookies
    const companies = await getCompanies();
    res.render('understory-toplist', { title: 'Understory Toplist', companies, loggedIn 

    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Axel er en tiss");
  }
});

module.exports = router;