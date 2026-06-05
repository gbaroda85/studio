'use server';
/**
 * @fileOverview An AI flow to extract text from an image (OCR).
 *
 * - imageToText - A function that handles the text extraction process.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const ImageToTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  success: z.boolean(),
  text: z.string().optional(),
  error: z.string().optional(),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    try {
      // Using 2.5 Flash as it is the most stable and updated for OCR tasks
      const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: [
          {
            text: 'You are an expert at Optical Character Recognition (OCR). Extract all text from the provided image accurately. Preserve line breaks and formatting as much as possible. If the image is a document, ID card, or certificate, extract all visible text content precisely. Output ONLY the extracted text.',
          },
          {
            media: {
              url: input.photoDataUri,
            },
          },
        ],
        config: {
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
          ],
        }
      });

      if (!llmResponse.text) {
          return { success: false, error: 'AI could not find or extract any text from this image.' };
      }

      return {
        success: true,
        text: llmResponse.text,
      };
    } catch (error: any) {
      console.error('[OCR Flow Error]:', error);
      return { 
        success: false, 
        error: error.message || 'AI engine failed to process the image.' 
      };
    }
  }
);