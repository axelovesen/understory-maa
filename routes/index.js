var express = require('express');
var router = express.Router();

//henter hjemmesiden
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//GET understory toplist siden
router.get('/understory-toplist', function(req, res, next) {
  const loggedIn = false; //starter med å ha den false, endres senere når vi bytter til session-check / kan evt endres nå

  const companies = [
    { name: 'Company A', score: 95 },
    { name: 'Company B', score: 90 },
    { name: 'Company C', score: 85 },
  ];
  
  res.render('understory-toplist', { title: 'Understory Toplist', companies, loggedIn });
});

module.exports = router;