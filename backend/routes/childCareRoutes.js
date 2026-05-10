const express = require('express');
const router = express.Router();
const childCareController = require('../controllers/childCareController');
const auth = require('../middleware/auth');

router.post('/add-child', auth, childCareController.addChild);
router.post('/add-growth', auth, childCareController.addGrowthRecord);
router.get('/my-children', auth, childCareController.getChildren);
router.get('/smart-search', auth, childCareController.smartSearch);

module.exports = router;
