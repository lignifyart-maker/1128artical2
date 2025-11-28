// Vercel Serverless Function to proxy Gemini API requests with streaming support
// This keeps the API key secure on the server side and enables real-time content delivery

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { prompt, systemInstruction } = req.body;

        const MODEL_NAME = "gemini-2.0-flash-exp";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:streamGenerateContent`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        };

        // Set headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await fetch(`${API_URL}?key=${API_KEY}&alt=sse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            res.write(`data: ${JSON.stringify({ error: `API Error: ${response.status}`, details: errorData })}\n\n`);
            res.end();
            return;
        }

        // Stream the response from Gemini API to the client
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                res.write('data: [DONE]\n\n');
                res.end();
                break;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Forward each chunk to the client
            res.write(`data: ${chunk}\n\n`);
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Internal server error', message: error.message })}\n\n`);
        res.end();
    }
}
