var express = require('express');
var router = express.Router();

const companies = [
  { name: 'Company A', score: 95 },
  { name: 'Company B', score: 90 },
  { name: 'Company C', score: 85 },
];

//henter hjemmesiden
router.get('/', function(req, res) {
  const loggedIn = false; //starter med å ha den false, endres senere når vi bytter til session-check / kan evt endres nå
  res.render('index', { title: 'Understory Bjellesauer' 
  , companies, loggedIn });
});

//GET understory toplist siden, bare synlig hvis logget inn
router.get('/understory-toplist', function(req, res) {
  const loggedIn = true; //midltertidig løsning før session/cookies
  res.render('understory-toplist', { title: 'Understory Toplist', companies, loggedIn });
});

module.exports = router;

const pool = require('../db');

async function getTopCompanies() {
  const [rows] = await pool.query(
    'SELECT name, score FROM companies ORDER BY score DESC LIMIT 10');
  return rows;
}