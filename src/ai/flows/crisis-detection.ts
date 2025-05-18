'use server';

/**
 * @fileOverview An AI agent that detects crisis cues in user messages and responds with support.
 *
 * - detectCrisis - A function that handles the crisis detection process.
 * - DetectCrisisInput - The input type for the detectCrisis function.
 * - DetectCrisisOutput - The return type for the detectCrisis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCrisisInputSchema = z.object({
  message: z.string().describe('The user message to analyze for crisis cues.'),
});
export type DetectCrisisInput = z.infer<typeof DetectCrisisInputSchema>;

const DetectCrisisOutputSchema = z.object({
  isCrisis: z.boolean().describe('Whether the message indicates a crisis.'),
  response: z.string().describe('A supportive response with grounding techniques and hotline references.'),
});
export type DetectCrisisOutput = z.infer<typeof DetectCrisisOutputSchema>;

export async function detectCrisis(input: DetectCrisisInput): Promise<DetectCrisisOutput> {
  return detectCrisisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCrisisPrompt',
  input: {schema: DetectCrisisInputSchema},
  output: {schema: DetectCrisisOutputSchema},
  prompt: `You are an AI assistant designed to detect crisis situations in user messages.

  Analyze the following message and determine if it contains cues indicating self-harm, suicidal thoughts, or a crisis situation.

  If a crisis is detected, respond with a supportive message that includes grounding techniques and provides hotline references.  Set isCrisis to true, otherwise set isCrisis to false and return an empty response.

  Message: {{{message}}}

  Follow this format:
  {
    "isCrisis": true/false,
    "response": "Supportive message with grounding techniques and hotline references."
  }`,
});

const detectCrisisFlow = ai.defineFlow(
  {
    name: 'detectCrisisFlow',
    inputSchema: DetectCrisisInputSchema,
    outputSchema: DetectCrisisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
