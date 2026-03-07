const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testV1() {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-1.5-flash";

    try {
        console.log(`Testing ${modelName} with explicit v1...`);
        // The current SDK (0.24.x) uses v1beta by default for some models.
        // Let's try to pass the API version to getGenerativeModel
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
        const result = await model.generateContent("test");
        console.log(`${modelName} works with v1!`);
    } catch (err) {
        console.error(`${modelName} with v1 failed:`, err.message);
    }
}

testV1();
