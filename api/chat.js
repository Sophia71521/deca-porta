// Vercel Serverless Function to proxy OpenRouter API requests
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
        // Call OpenRouter API from the server (no CORS issues)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://deca-porta.vercel.app',
                'X-Title': 'DECA Portal'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful DECA competition assistant. Provide clear, concise answers about business, marketing, finance, hospitality, and entrepreneurship topics for high school students.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        const data = await response.json();

        console.log('OpenRouter response status:', response.status);
        console.log('OpenRouter response data:', data);

        // If error from OpenRouter, pass it through with details
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || 'API Error',
                details: data,
                status: response.status
            });
        }

        // Return the response to the client
        res.status(200).json(data);
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        res.status(500).json({
            error: 'Failed to fetch from AI',
            message: error.message,
            details: error.toString()
        });
    }
}
