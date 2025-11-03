/*var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
*/

var express = require('express');
var router = express.Router();

router.get('/', (req, res) => res.render('index'));   // <- bruker views/index.ejs
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

module.exports = router;