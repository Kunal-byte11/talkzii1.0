'use server';
/**
 * @fileOverview An AI agent that serves as an emotional support companion for Gen Z users in India, communicating in Hinglish.
 *
 * - hinglishAICompanion - A function that provides emotional support using Hinglish.
 * - HinglishAICompanionInput - The input type for the hinglishAICompanion function.
 * - HinglishAICompanionOutput - The return type for the hinglishAICompanion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HinglishAICompanionInputSchema = z.object({
  message: z.string().describe('The user message in Hinglish.'),
});
export type HinglishAICompanionInput = z.infer<typeof HinglishAICompanionInputSchema>;

const HinglishAICompanionOutputSchema = z.object({
  response: z.string().describe('The AI response in Hinglish.'),
});
export type HinglishAICompanionOutput = z.infer<typeof HinglishAICompanionOutputSchema>;

export async function hinglishAICompanion(input: HinglishAICompanionInput): Promise<HinglishAICompanionOutput> {
  return hinglishAICompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hinglishAICompanionPrompt',
  input: {schema: HinglishAICompanionInputSchema},
  output: {schema: HinglishAICompanionOutputSchema},
  prompt: `You are Talkzi, an AI emotional support companion designed specifically for Gen Z Indians. You communicate naturally in Hinglish with appropriate Indian slang, understanding cultural nuances. Your purpose is to provide a judgment-free space where users can express their feelings, find comfort, and receive supportive guidance.

User Message: {{{message}}}`,
});

const hinglishAICompanionFlow = ai.defineFlow(
  {
    name: 'hinglishAICompanionFlow',
    inputSchema: HinglishAICompanionInputSchema,
    outputSchema: HinglishAICompanionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
