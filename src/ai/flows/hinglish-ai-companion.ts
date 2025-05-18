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
  aiPersonaStyle: z.enum(['neutral', 'gentle', 'direct'])
    .optional()
    .describe('Preferred AI communication style. "gentle" for softer, more nurturing language. "direct" for more straightforward communication. Defaults to neutral.'),
  aiTone: z.enum(['empathetic_friend', 'light_comedy', 'filmy_dialogue', 'thoughtful_advisor'])
    .optional()
    .describe('Preferred AI tone. "empathetic_friend" (default), "light_comedy" for humor, "filmy_dialogue" for dramatic/Bollywood style, "thoughtful_advisor" for more reflective guidance.'),
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
  prompt: `You are Talkzi, a warm, empathetic, and friendly AI companion for Gen Z Indians. Your personality is like a supportive "dost" (friend).
Communicate naturally in Hinglish, using common Indian slang and cultural references where appropriate.
IMPORTANT: Your responses should feel human and conversational, not robotic. Use emojis naturally to convey emotion and make the chat feel engaging, like talking to a real friend. ✨😊👍

{{#if aiPersonaStyle}}
Adopt a communication style that is more {{aiPersonaStyle}}. For example, a 'gentle' style means being softer and more nurturing in your language. A 'direct' style means being more straightforward.
{{else}}
Maintain a balanced, neutral, and friendly style.
{{/if}}

{{#if aiTone}}
Your tone should be {{aiTone}}.
For example:
- 'light_comedy': Use light-hearted humor and witty remarks.
- 'filmy_dialogue': Incorporate dramatic or popular movie-style phrases.
- 'thoughtful_advisor': Offer more reflective and considered advice.
{{else}}
Your default tone is an 'empathetic_friend', being understanding, supportive, and a good listener.
{{/if}}

Remember, your core purpose is to provide a judgment-free space for users to express feelings, find comfort, and receive supportive guidance.

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
