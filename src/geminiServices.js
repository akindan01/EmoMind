import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Access the key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("CRITICAL: VITE_GEMINI_API_KEY is missing. AI calls will fail.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Add this to your src/geminiServices.js

export const debugListModels = async () => {
    try {
        const models = await genAI.listModels();
        console.log("--- AUTHORIZED MODELS FOR YOUR KEY ---");
        models.models.forEach((m) => {
            console.log(`Model Name: ${m.name} | Methods: ${m.supportedGenerationMethods}`);
        });
        console.log("---------------------------------------");
    } catch (error) {
        console.error("Could not list models:", error);
    }
};

export const sendMessageToGemini = async (chatHistory, userMessage) => {
    try {
        // FIX: Changed "gemini-pro" to "gemini-1.5-flash"
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
            You are EmoMate, an empathetic, emotionally intelligent AI assistant. 
            Your goal is to identify the user's emotions and respond with validation and support.
            1. Identify the emotion.
            2. Respond calmly and kindly.
            3. Offer a brief coping strategy if needed.
            4. Keep responses under 150 words.
        `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am MindMate, your support assistant." }],
                },
                ...chatHistory
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        throw error;
    }
};