
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Initialize Genkit with Google AI plugin.
 * Note: GOOGLE_GENAI_API_KEY must be set in production environment variables.
 */
export const ai = genkit({
  plugins: [
    googleAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});
