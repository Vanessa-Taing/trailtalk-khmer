import dotenv from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if it exists, otherwise load .env
if (existsSync('.env.local')) {
    dotenv.config({ path: '.env.local' });
} else {
    dotenv.config();
}

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Your existing API route
app.post('/api/generateContent', async (req, res) => {
    try {
        console.log('=== API Request Received ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const { model, contents, config } = req.body;

        if (!model || !contents) {
            console.log('Missing model or contents');
            return res.status(400).json({ error: 'Missing model or contents in request body' });
        }

        console.log('Calling Gemini with model:', model);
        console.log('Contents:', contents);
        console.log('Config:', config);

        // Use the original API structure that was working
        const response = await ai.models.generateContent({
            model,
            contents,
            config
        });

        console.log('=== Gemini Response ===');
        console.log('Raw output:', response.text);
        console.log('========================');

        res.json({ text: response.text });

    } catch (error) {
        console.error('=== Error in API ===');
        console.error('Error calling Gemini API:', error);
        console.error('Error details:', error.message);
        console.error('==================');
        
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: 'Failed to generate content from Gemini API', details: errorMessage });
    }
});

// NEW: Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// NEW: Catch all handler - send back React's index.html file for any non-API routes
// This pattern works better with Express 5.x
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Handle all other routes that don't start with /api
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});