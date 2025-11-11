import { GoogleGenAI } from "@google/genai";
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');

  if (!prompt) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Prompt is required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  if (!process.env.API_KEY) {
    console.error("API_KEY not set in Netlify environment variables");
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Server configuration error: API key is missing.' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text;
    if (!text) {
      throw new Error("The API returned an empty response.");
    }
    
    // This logic was originally in the client-side service, moving it here keeps the client clean.
    if (text.startsWith('```') && text.endsWith('```')) {
        text = text.substring(3, text.length - 3).trim();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: text.trim() }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Failed to generate content from the AI model.' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
