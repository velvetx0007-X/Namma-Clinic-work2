const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

/**
 * Service to handle Machine Learning and AI operations.
 * Delegation to FastAPI service when available.
 */
class MLService {
    constructor() {
        this.apiKey = (process.env.GEMINI_API_KEY || '').trim();
        this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        this.aiServiceToken = process.env.AI_SERVICE_TOKEN;

        // Only for chat (legacy/direct fallback)
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        } else {
            this.genAI = null;
        }

        this.fallbackModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    }

    /**
     * Processes a lab test document using FastAPI (primary) or local mock.
     */
    async processLabTest(filePath, mimeType) {
        if (!this.aiServiceUrl || !this.aiServiceToken) {
            console.warn("AI Service not configured, using mock.");
            return this.getMockLabTest();
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath), {
                contentType: mimeType,
                filename: 'document'
            });

            const response = await axios.post(`${this.aiServiceUrl}/process-lab-test`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.aiServiceToken}`
                }
            });

            return response.data;
        } catch (error) {
            console.error("FastAPI Lab Test Error:", error.response?.data || error.message);
            return this.getMockLabTest();
        }
    }

    getMockLabTest() {
        return {
            testName: "Lab Test (Analysis Unavailable)",
            patientName: "Unknown",
            date: new Date().toLocaleDateString(),
            results: [{ parameter: "Error", value: "AI service unavailable", unit: "-", referenceRange: "-" }],
            conclusion: "The AI service is currently unavailable. Please review the document manually."
        };
    }

    /**
     * Processes a prescription image/PDF using FastAPI (primary) or local mock.
     */
    async processPrescription(filePath, mimeType) {
        if (!this.aiServiceUrl || !this.aiServiceToken) {
            console.warn("AI Service not configured, using mock.");
            return this.getMockPrescription();
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath), {
                contentType: mimeType,
                filename: 'prescription'
            });

            const response = await axios.post(`${this.aiServiceUrl}/process-prescription`, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${this.aiServiceToken}`
                }
            });

            return response.data;
        } catch (error) {
            console.error("FastAPI Prescription Error:", error.response?.data || error.message);
            return this.getMockPrescription();
        }
    }

    getMockPrescription() {
        return {
            complaints: "Not provided",
            reason: "General Consultation",
            time: new Date().toLocaleTimeString(),
            vitals: "Not provided",
            diagnosis: "Analysis Unavailable",
            advice: "Please consult with your doctor manually. The AI service is currently offline.",
            investigations: "Not provided",
            followUp: "Not provided",
            medications: []
        };
    }

    /**
     * Handles chat interaction (direct Gemini fallback for now).
     */
    async chatWithAssistant(message, context) {
        if (!this.genAI) return "The AI assistant is currently offline. Please try again later.";

        try {
            for (const modelName of this.fallbackModels) {
                try {
                    const model = this.genAI.getGenerativeModel({ model: modelName });
                    const instruction = `
                        You are a helpful, professional, and empathetic AI Health Assistant for "Health One".
                        Your goal is to provide general health information, wellness tips, and guidance on food, exercise, warmup, and yoga.
                        IMPORTANT:
                        - Always advise users to consult a doctor for specific medical diagnosis or treatment.
                        - Do NOT provide medical prescriptions or diagnose serious conditions.
                        User Context: ${context || 'General User'}
                    `;

                    const chat = model.startChat({
                        history: [
                            { role: "user", parts: [{ text: instruction }] },
                            { role: "model", parts: [{ text: "Understood. I am ready to assist." }] },
                        ],
                    });

                    const result = await chat.sendMessage(message);
                    const response = await result.response;
                    return response.text();
                } catch (e) {
                    continue;
                }
            }
            throw new Error("All models failed");
        } catch (error) {
            console.error("AI Chat Error:", error.message);
            return "I'm having trouble connecting to my brain right now.";
        }
    }

    /**
     * Analyzes a clinic review for sentiment and keywords.
     */
    async analyzeReview(comment) {
        if (!this.genAI) {
            return { sentiment: 'neutral', keywords: [] };
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                Analyze the following clinic review. 
                1. Detect the overall sentiment: 'positive', 'neutral', or 'negative'.
                2. Extract up to 5 key topics or keywords (e.g., "fast service", "cleanliness", "long wait").
                
                Review: "${comment}"
                
                Respond ONLY in the following JSON format:
                {
                    "sentiment": "positive/neutral/negative",
                    "keywords": ["keyword1", "keyword2", ...]
                }
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Clean response text if it contains markdown code blocks
            const jsonStr = responseText.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("AI Review Analysis Error:", error.message);
            return { sentiment: 'neutral', keywords: [] };
        }
    }
}

module.exports = new MLService();
