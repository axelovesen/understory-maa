// routes/packages.js
var express = require('express');
var { requireAuth } = require('../middleware/krevAutentifisering');
var router = express.Router();

var packages = [
  { id: 1, name: 'Starter', tier: 'Basic', features: ['A','B','C'] },
  { id: 2, name: 'Growth',  tier: 'Pro',   features: ['A','B','C','D'] },
  { id: 3, name: 'Scale',   tier: 'Enterprise', features: ['A','B','C','D','E'] },
];

var industries = [
  { id: 10, name: 'Fintech' },
  { id: 11, name: 'Hospitality' },
  { id: 12, name: 'E-commerce' },
];

var industryPackage = [
  { industryId: 10, packageId: 2, percent: 62 },
  { industryId: 10, packageId: 3, percent: 28 },
  { industryId: 11, packageId: 1, percent: 55 },
  { industryId: 12, packageId: 2, percent: 49 },
];

router.get('/teaser/packages', (req, res) => {
  res.json(packages.map(p => ({ id: p.id, name: p.name, tier: p.tier })));
});

router.get('/packages', requireAuth, (req, res) => {
  res.json(packages);
});

router.get('/insights/industries', requireAuth, (req, res) => {
  const result = industries.map(ind => {
    const dist = industryPackage
      .filter(x => x.industryId === ind.id)
      .map(x => ({ package: packages.find(p => p.id === x.packageId)?.name, percent: x.percent }));
    return { industry: ind.name, distribution: dist };
  });
  res.json(result);
});

module.exports = router;