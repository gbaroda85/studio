'use server';
/**
 * @fileOverview An AI flow to enhance a photo's quality.
 *
 * - enhancePhoto - A function that handles the photo enhancement process.
 * - EnhancePhotoInput - The input type for the enhancePhoto function.
 * - EnhancePhotoOutput - The return type for the enhancePhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be enhanced, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhancePhotoInput = z.infer<typeof EnhancePhotoInputSchema>;

const EnhancePhotoOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The resulting enhanced image, as a data URI."
    ),
});
export type EnhancePhotoOutput = z.infer<typeof EnhancePhotoOutputSchema>;

export async function enhancePhoto(input: EnhancePhotoInput): Promise<EnhancePhotoOutput> {
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
            {media: {url: input.photoDataUri}},
            {text: 'Enhance the lighting, colors, and sharpness of the provided photograph to make it look like a high-quality, professional photo. Do not add any new elements or change the composition. The output must be the enhanced image.'},
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
        throw new Error('Failed to generate enhanced image.');
    }

    return { imageDataUri: media.url };
}
