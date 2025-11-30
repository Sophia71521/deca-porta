// Vercel Serverless Function to proxy Hugging Face API requests
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get API key and message from request body
    const { apiKey, message } = req.body;

    if (!apiKey || !message) {
        return res.status(400).json({ error: 'Missing apiKey or message' });
    }

    try {
        // Call Hugging Face API from the server (no CORS issues)
        const response = await fetch('https://router.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: `You are a helpful DECA competition assistant. Provide clear, concise answers about business, marketing, finance, hospitality, and entrepreneurship topics for high school students.

User: ${message}`
            })
        });

        const data = await response.json();

        // Return the response to the client
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error calling Hugging Face API:', error);
        res.status(500).json({ error: 'Failed to fetch from AI' });
    }
}
