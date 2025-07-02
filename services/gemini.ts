import { LANGUAGES } from '../constants';
import type { LanguageCode, Word } from '../types';

// Remove the GoogleGenAI import and initialization since we're using the server
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const phoneticsCache: Record<string, string> = JSON.parse(localStorage.getItem('lingotrek-phonetics') || '{}');

const savePhoneticsCache = () => {
    try {
        localStorage.setItem('lingotrek-phonetics', JSON.stringify(phoneticsCache));
    } catch (e) {
        console.error("Could not save phonetics cache, might be full.", e);
    }
};

// Helper function to call your server's API
const callGeminiAPI = async (prompt: string, config?: any): Promise<string> => {
    try {
        const response = await fetch('/api/generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gemini-2.5-flash-preview-04-17',
                contents: prompt,
                config: config || {}
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error('Error calling server API:', error);
        throw error;
    }
};

export const getPhonetics = async (word: string, langCode: LanguageCode): Promise<string> => {
    const cacheKey = `${langCode}-${word}`.toLowerCase();
    
    if (phoneticsCache[cacheKey]) {
        return phoneticsCache[cacheKey];
    }

    try {
        const langName = LANGUAGES[langCode].name;
        const prompt = `Provide the International Phonetic Alphabet (IPA) transcription for the word "${word}" in ${langName}. Return only the IPA string itself, without any extra text or explanation. For example, for "Hello" in English, you would return just "/həˈloʊ/". Word: "${word}"`;
        
        const phonetic = await callGeminiAPI(prompt);
        
        if (phonetic) {
            phoneticsCache[cacheKey] = phonetic.trim();
            savePhoneticsCache();
        }
        
        return phonetic.trim();
    } catch (error) {
        console.error(`Error getting phonetics for "${word}"`, error);
        return "";
    }
};

export const translateText = async (
    text: string,
    from: LanguageCode,
    to: LanguageCode
): Promise<string> => {
    if (!text.trim()) {
        return "";
    }

    try {
        const fromLanguage = LANGUAGES[from].name;
        const toLanguage = LANGUAGES[to].name;
        const prompt = `Translate the following text from ${fromLanguage} to ${toLanguage}. Provide only the translated text, without any additional explanations or context. Text to translate: "${text}"`;
        
        const translatedText = await callGeminiAPI(prompt);
        return translatedText.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        return "Translation failed.";
    }
};

export const generatePhrase = async (word: Word, langCode: LanguageCode): Promise<Word | null> => {
    try {
        const langName = LANGUAGES[langCode].name;
        const englishWord = word['EN'];
        const nativeWord = word[langCode];
        const prompt = `Create a simple, common travel-related sentence in ${langName} using the word "${nativeWord}". Also provide the exact English translation of that sentence. Return the response as a JSON object with keys "native" and "english". Example for word 'water': {"native": "...", "english": "Can I have some water?"}.`;
        
        const response = await callGeminiAPI(prompt, {
            responseMimeType: "application/json",
        });

        let jsonStr = response.trim();
        
        // Handle code fence removal
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr);
        
        if (parsedData.native && parsedData.english) {
            return {
                [langCode]: parsedData.native,
                'EN': parsedData.english,
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error generating phrase:", error);
        return null;
    }
};

export const generateCombinedPhrase = async (words: Word[], langCode: LanguageCode): Promise<Word | null> => {
    if (words.length === 0) {
        return null;
    }

    try {
        const langName = LANGUAGES[langCode].name;
        const nativeWords = words.map(w => w[langCode]);
        
        const prompt = `You are a language learning assistant. Create a single, simple, coherent travel-related sentence in ${langName} that uses several of the following words: "${nativeWords.join(', ')}". Then provide the exact English translation of that sentence. Return ONLY a JSON object with keys "native" and "english". Example: {"native": "...", "english": "..."}.`;
        
        const response = await callGeminiAPI(prompt, {
            responseMimeType: "application/json",
        });

        let jsonStr = response.trim();
        
        // Handle code fence removal
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr);
        
        if (parsedData.native && parsedData.english) {
            return {
                [langCode]: parsedData.native,
                'EN': parsedData.english,
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error generating combined phrase:", error);
        return null;
    }
};