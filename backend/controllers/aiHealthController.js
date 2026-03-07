const mlService = require("../services/mlService");

exports.chatWithAI = async (req, res) => {
    try {
        const { message, context } = req.body;
        console.log("🤖 AI Health Chat Request:", { message, context });

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const text = await mlService.chatWithAssistant(message, context);
        console.log("✅ AI Response successful");

        res.status(200).json({
            success: true,
            reply: text
        });

    } catch (error) {
        console.error("Error in chatWithAI:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
