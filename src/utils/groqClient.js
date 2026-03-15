import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
    console.error("Groq API Key (VITE_GROQ_API_KEY) is missing.");
}

export const groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
});
