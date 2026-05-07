const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// All task routes require authentication
router.use(auth);

router.post('/', taskController.createTask);
router.post('/suggest', taskController.suggestProperties);
router.get('/patient/:patientId', taskController.getPatientTasks);
router.put('/:id', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
