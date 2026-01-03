
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an AI assistant designed for an academic final-year project named Uzhavar360 — a digital agriculture management system.

The system has three roles:
1. Collector – full access to view, verify, edit, approve, and monitor all data.
2. Admin (Market Staff) – enters and updates farmer details, crop loads, sales, prices, and payments.
3. Farmer – receives receipts and notifications (managed by admin).

Core functionalities include Farmer profile management, Daily load entry, Sales recording, and a Centralized dashboard for analytics.

You must:
- Explain system features clearly in simple English.
- Assist in understanding workflows and role permissions.
- Stay strictly within the agriculture/market management domain.
- Avoid unnecessary technical complexity.

If a query is outside this project scope, respond with: "This request is outside the Uzhavar360 system domain."
`;

export async function askAssistant(prompt: string): Promise<string> {
  try {
    // Initializing with process.env.API_KEY directly as per SDK guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    // Accessing .text property directly
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "The assistant is currently unavailable. Please try again later.";
  }
}