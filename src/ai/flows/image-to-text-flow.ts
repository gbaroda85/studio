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

const ImageToTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
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
    const llmResponse = await ai.generate({
      prompt: [
        {
          text: 'You are an expert at Optical Character Recognition (OCR). Extract all text from the provided image accurately. Preserve line breaks and formatting as much as possible.',
        },
        {
          media: {
            url: input.photoDataUri,
          },
        },
      ],
    });

    return {
      text: llmResponse.text,
    };
  }
);
