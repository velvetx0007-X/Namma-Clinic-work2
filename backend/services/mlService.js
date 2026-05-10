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
     * Processes a prescription image/PDF using FastAPI (primary) or Gemini Vision (fallback).
     */
    async processPrescription(filePath, mimeType) {
        // Try FastAPI first
        if (this.aiServiceUrl && this.aiServiceToken) {
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
                console.warn("FastAPI Prescription Error, falling back to Gemini Vision:", error.message);
            }
        }

        // Direct Gemini Vision Fallback
        if (!this.genAI) {
            console.warn("Gemini AI not configured, using mock.");
            return this.getMockPrescription();
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const imageData = fs.readFileSync(filePath).toString("base64");

            const prompt = `
                Analyze this medical prescription image or PDF. 
                Extract the following information in a STRICT JSON format:
                {
                    "complaints": "patient's issues",
                    "diagnosis": "doctor's diagnosis",
                    "medications": [
                        { "drugName": "name", "dosage": "e.g. 500mg", "frequency": "e.g. 1-0-1", "duration": "e.g. 5 days", "instructions": "e.g. After food" }
                    ],
                    "advice": "additional advice",
                    "investigations": "lab tests suggested",
                    "followUp": "next visit"
                }

                Guidelines:
                - If handwritten, do your best to decipher.
                - If not provided, use "Not provided".
                - Medications list should be empty if none found.
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageData,
                        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : 'image/jpeg'
                    }
                }
            ]);

            const responseText = result.response.text();
            const jsonStr = responseText.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Vision Prescription Error:", error.message);
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
     * Now returns a structured response for better UI rendering.
     */
    async chatWithAssistant(message, context) {
        if (!this.genAI) {
            return JSON.stringify({
                title: "Assistant Offline",
                summary: "The AI assistant is currently offline.",
                recommendation: "Please try again later or contact support.",
                safetyNote: "Always consult a doctor for medical emergencies.",
                isError: true
            });
        }

        try {
            for (const modelName of this.fallbackModels) {
                try {
                    const model = this.genAI.getGenerativeModel({ model: modelName });
                    const instruction = `
                        You are a helpful, professional, and empathetic AI Health Assistant for "Namma Clinic".
                        Your goal is to provide high-quality health information, wellness tips, and guidance on food, exercise, warmup, and yoga.
                        
                        RESPONSE STRUCTURE (STRICT JSON):
                        Respond ONLY in the following JSON format:
                        {
                            "title": "Short descriptive title",
                            "summary": "Concise summary of the answer",
                            "recommendation": "Actionable advice or tips",
                            "safetyNote": "Crucial health safety reminder"
                        }

                        GUIDELINES:
                        - For food: Suggest balanced nutrition, hydration, and natural foods.
                        - For exercise/yoga: Suggest safe, beginner-friendly movements.
                        - Safety: Always include a note about consulting professional doctors.
                        - Context: Use the user's recent history if available.
                        
                        User Context: ${context || 'General User'}
                    `;

                    const chat = model.startChat({
                        history: [
                            { role: "user", parts: [{ text: instruction }] },
                            { role: "model", parts: [{ text: "Understood. I will provide structured health advice in JSON format." }] },
                        ],
                    });

                    const result = await chat.sendMessage(message);
                    const responseText = await result.response.text();
                    
                    // Validate if it's JSON
                    try {
                        const jsonStr = responseText.replace(/```json|```/g, '').trim();
                        JSON.parse(jsonStr); // test parse
                        return jsonStr;
                    } catch (e) {
                        // Fallback if not JSON
                        return JSON.stringify({
                            title: "Health Insight",
                            summary: responseText.substring(0, 200),
                            recommendation: responseText,
                            safetyNote: "Please consult a doctor for specific medical advice."
                        });
                    }
                } catch (e) {
                    console.error(`Model ${modelName} failed:`, e.message);
                    continue;
                }
            }
            throw new Error("All models failed");
        } catch (error) {
            console.error("AI Chat Error:", error.message);
            return JSON.stringify({
                title: "Service Error",
                summary: "AI Assistant is temporarily unavailable. Please try again.",
                recommendation: "If the problem persists, please use manual records.",
                safetyNote: "For emergencies, call your local emergency number immediately.",
                isError: true
            });
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
