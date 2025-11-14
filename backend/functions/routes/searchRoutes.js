const express = require('express');
const router = express.Router();
const {searchProperties} = require('../controllers/propertyController');

router.route('/').get(searchProperties);

module.exports = router;
