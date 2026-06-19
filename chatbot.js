const { GoogleGenerativeAI } = require("@google/generative-ai");

class HealthChatbot {

    async chat(userMessage) {

        try {

            const genAI = new GoogleGenerativeAI(
                process.env.GEMINI_API_KEY
            );

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash"
            });

            const prompt = `
You are an advanced AI Public Health Assistant.

Always answer in a structured and professional format.

Rules:
- Use headings
- Use bullet points
- Highlight important medical points
- Keep answers easy to read
- Use short paragraphs
- Add prevention tips if relevant
- Add warning signs if condition is serious
- Use markdown formatting

Structure example:

## Overview
Short explanation

## Symptoms
- Point 1
- Point 2

## Causes
- Cause 1
- Cause 2

## Prevention
- Tip 1
- Tip 2

## When to See a Doctor
- Warning sign 1
- Warning sign 2

User Question:
${userMessage}
`;

            const result = await model.generateContent(prompt);

            const response = result.response.text();

            return response;

        } catch (error) {

            console.log("FULL GEMINI ERROR:");
            console.log(error);

            throw error;

        }

    }

}

module.exports = { HealthChatbot };