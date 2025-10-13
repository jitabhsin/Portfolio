// api/chat.js

/**
 * Calls the Hugging Face Inference API.
 * Throws an error on failure, which triggers the fallback.
 */
const callHuggingFace = async (body) => {
    const HF_API_TOKEN = process.env.HF_API_TOKEN;
    const HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

    if (!HF_API_TOKEN) {
        throw new Error('Missing server-side HF_API_TOKEN');
    }

    // Convert the message history into a single prompt string for HF
    const prompt = body.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const hfPayload = {
        inputs: prompt,
        parameters: {
            max_new_tokens: 512,
            return_full_text: false, // Important: only get the generated text
        },
    };

    const hfUrl = `https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`;
    const response = await fetch(hfUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(hfPayload)
    });

    console.log(`Hugging Face (${HF_MODEL}) response status:`, response.status);

    if (!response.ok) {
        const errorText = await response.text();
        // A 503 error means the model is loading, a perfect reason to fallback.
        throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text;

    if (!generatedText) {
        throw new Error('Invalid response structure from Hugging Face');
    }

    // Standardize the response to match what the frontend expects
    return {
        choices: [{
            message: {
                role: 'assistant',
                content: generatedText.trim()
            }
        }]
    };
};

/**
 * Calls the OpenRouter API.
 * This is used as a fallback.
 */
const callOpenRouter = async (body) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        throw new Error('Missing server-side OPENROUTER_API_KEY');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: body.model || 'mistralai/mistral-7b-instruct:free',
            messages: body.messages
        }),
    });

    console.log(`OpenRouter (${body.model}) response status:`, response.status);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    return await response.json();
};


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;

        // --- Attempt 1: Hugging Face (Primary) ---
        try {
            console.log("Attempting to use Hugging Face...");
            const hfData = await callHuggingFace(body);
            return res.status(200).json(hfData);
        } catch (hfError) {
            console.warn(`Hugging Face failed: "${hfError.message}". Falling back to OpenRouter.`);

            // --- Attempt 2: OpenRouter (Fallback) ---
            try {
                console.log("Attempting to use OpenRouter...");
                const orData = await callOpenRouter(body);
                return res.status(200).json(orData);
            } catch (orError) {
                console.error(`OpenRouter also failed: "${orError.message}"`);
                return res.status(500).json({ error: 'Both AI services are currently unavailable.' });
            }
        }
    } catch (err) {
        console.error('Server proxy error:', err);
        return res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
}