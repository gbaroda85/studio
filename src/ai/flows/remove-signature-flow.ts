'use server';
/**
 * @fileOverview An AI flow to remove signatures from an image.
 *
 * - removeSignature - A function that handles the signature removal process.
 * - RemoveSignatureInput - The input type for the removeSignature function.
 * - RemoveSignatureOutput - The return type for the removeSignature function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RemoveSignatureInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing a signature to be removed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveSignatureInput = z.infer<typeof RemoveSignatureInputSchema>;

const RemoveSignatureOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The resulting image with the signature removed, as a data URI."
    ),
});
export type RemoveSignatureOutput = z.infer<typeof RemoveSignatureOutputSchema>;

export async function removeSignature(input: RemoveSignatureInput): Promise<RemoveSignatureOutput> {
  return removeSignatureFlow(input);
}

const removeSignatureFlow = ai.defineFlow(
  {
    name: 'removeSignatureFlow',
    inputSchema: RemoveSignatureInputSchema,
    outputSchema: RemoveSignatureOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
          {media: {url: input.photoDataUri}},
          {text: 'You are an expert image editor. Your task is to identify and remove all signatures from the provided image. You must maintain the background texture and content where the signature was located so that the removal is seamless and invisible. The output must be the final image without the signature.'},
      ],
      config: {
          responseModalities: ['TEXT', 'IMAGE'],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          ],
      },
    });

    if (!media?.url) {
        throw new Error('Failed to generate image with removed signature.');
    }

    return { imageDataUri: media.url };
  }
);
