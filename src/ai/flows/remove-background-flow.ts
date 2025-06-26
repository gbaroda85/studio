'use server';
/**
 * @fileOverview An AI flow to remove the background from an image.
 *
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a subject, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The resulting image with the background removed, as a data URI."
    ),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  const {media} = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Task: Background Removal. Input: Image. Your task is to remove the background from the provided image. The output must be a PNG image with a transparent background, containing only the main subject from the original image. Do not add any text, explanation, or other content. The output must be ONLY the resulting image.'},
    ],
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
        ],
    },
  });

  if (!media?.url) {
      throw new Error('Failed to generate image with removed background.');
  }

  return { imageDataUri: media.url };
}
