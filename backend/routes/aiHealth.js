const express = require('express');
const router = express.Router();
const aiHealthController = require('../controllers/aiHealthController');
const auth = require('../middleware/auth'); // Optional: enforce auth if needed

// Chat with AI
// POST /api/ai-health/chat
// Body: { message: "query", context: "optional user context" }
router.post('/chat', auth, aiHealthController.chatWithAI);

module.exports = router;
