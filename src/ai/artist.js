import { GoogleGenerativeAI } from '@google/generative-ai';
import { TRIAGE_SYSTEM_PROMPT } from './prompts.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function triagePrompt(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: TRIAGE_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
        // Clean the response text to ensure it's valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse AI Triage response:", text);
        throw new Error("AI Triage returned an invalid format. Please try rephrasing your prompt.");
    }
}