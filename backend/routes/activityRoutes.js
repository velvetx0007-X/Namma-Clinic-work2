const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.post('/update-steps', auth, activityController.updateSteps);
router.get('/daily-activity', auth, activityController.getDailyActivity);
router.post('/update-water', auth, activityController.updateWater);
router.post('/update-task', auth, activityController.updateTask);

module.exports = router;
