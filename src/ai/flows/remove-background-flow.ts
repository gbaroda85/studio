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
        {text: 'You are an expert at image editing. Your task is to remove the background from the provided image. The main subject must be perfectly preserved. The output must be a PNG image with a transparent background.'},
    ],
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media?.url) {
      throw new Error('Failed to generate image with removed background.');
  }

  return { imageDataUri: media.url };
}
