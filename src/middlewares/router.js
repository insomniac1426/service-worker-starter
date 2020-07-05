const express = require('express');

const router = express.Router();

router.post('/auth', function(req, res) {
  res.cookie('auth-sw', 'authenticated');
  res.json({ auth: true});
});

module.exports = router;
