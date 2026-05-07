const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Service for Smart Task Suggestions and Patient Insights
 */
class AIService {
    constructor() {
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    /**
     * Suggest task properties based on description
     * @param {string} description - The task description from staff
     * @returns {Object} { type, priority, dueDateSuggestion }
     */
    async suggestTaskProperties(description) {
        if (!this.model) return { type: 'General Message', priority: 'Medium' };

        const prompt = `
            As a healthcare assistant, analyze the following task description and suggest:
            1. Task Type (Medication, Appointment, Lab Test, or General Message)
            2. Priority (Low, Medium, High)
            3. Urgency factor (1-10)

            Description: "${description}"

            Respond ONLY in JSON format like:
            {"type": "Medication", "priority": "High", "urgency": 8}
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from response (sometimes AI adds markdown blocks)
            const jsonMatch = text.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { type: 'General Message', priority: 'Medium' };
        } catch (error) {
            console.error('AI Suggestion Error:', error);
            return { type: 'General Message', priority: 'Medium' };
        }
    }

    /**
     * Generate patient-friendly insight for a task
     * @param {string} title 
     * @param {string} description 
     * @returns {string} Short tip/insight
     */
    async getPatientInsight(title, description) {
        if (!this.model) return "";

        const prompt = `
            Provide a short, one-sentence patient-friendly health tip or "AI Insight" for this task:
            Title: "${title}"
            Description: "${description}"
            
            Example: "Take this medicine after food to avoid stomach upset."
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('AI Insight Error:', error);
            return "";
        }
    }

    /**
     * Summarize a long message for a patient
     */
    async summarizeMessage(message) {
        if (!this.model) return message;

        const prompt = `Summarize this medical message into a short, clear sentence for a patient: "${message}"`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            return message;
        }
    }
}

module.exports = new AIService();
