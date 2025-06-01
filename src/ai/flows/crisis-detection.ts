
'use server';

/**
 * @fileOverview An AI agent that previously detected crisis cues. This functionality is now primarily handled elsewhere.
 *
 * - detectCrisis - A function that calls the crisis detection flow.
 * - DetectCrisisInput - The input type for the detectCrisis function.
 * - DetectCrisisOutput - The return type for the detectCrisis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectCrisisInputSchema = z.object({
  message: z.string().describe('The user message to analyze.'),
});
export type DetectCrisisInput = z.infer<typeof DetectCrisisInputSchema>;

const DetectCrisisOutputSchema = z.object({
  isCrisis: z.boolean().describe('Whether the message indicates a crisis. This will always be false from this flow.'),
  response: z.string().describe('A supportive response. This will always be empty from this flow.'),
});
export type DetectCrisisOutput = z.infer<typeof DetectCrisisOutputSchema>;

export async function detectCrisis(input: DetectCrisisInput): Promise<DetectCrisisOutput> {
  return detectCrisisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectCrisisPrompt',
  input: {schema: DetectCrisisInputSchema},
  output: {schema: DetectCrisisOutputSchema},
  model: 'googleai/gemma-7b-it', // Model moved to top level and changed to Gemma
  prompt: `You are an AI assistant. Your previous role involved detecting crisis cues in user messages.
This specific crisis intervention messaging is no longer handled by this part of the system.

For any user message you receive, you MUST return the following JSON structure:
{
  "isCrisis": false,
  "response": ""
}

Do not deviate from this output structure.
User Message: {{{message}}}
`,
  // Config object can be removed if empty, or used for temperature, safetySettings etc.
  // For this prompt, default config is fine.
});

const detectCrisisFlow = ai.defineFlow(
  {
    name: 'detectCrisisFlow',
    inputSchema: DetectCrisisInputSchema,
    outputSchema: DetectCrisisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output conforms, although the prompt is very directive.
    if (output) {
      return {
        isCrisis: output.isCrisis || false,
        response: output.response || "",
      };
    }
    // Fallback if LLM somehow fails to produce valid output per schema
    return { isCrisis: false, response: "" };
  }
);
