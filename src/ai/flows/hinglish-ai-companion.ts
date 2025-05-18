
'use server';
/**
 * @fileOverview An AI agent that serves as an emotional support companion for Gen Z users in India, communicating in Hinglish.
 * It can adopt different "friend" personalities.
 *
 * - hinglishAICompanion - A function that provides emotional support using Hinglish with a selected persona.
 * - HinglishAICompanionInput - The input type for the hinglishAICompanion function.
 * - HinglishAICompanionOutput - The return type for the hinglishAICompanion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HinglishAICompanionInputSchema = z.object({
  message: z.string().describe('The user message in Hinglish.'),
  aiFriendType: z
    .enum(['female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend'])
    .optional()
    .describe('The selected AI friend personality type. Determines the AI\'s communication style and tone.'),
});
export type HinglishAICompanionInput = z.infer<typeof HinglishAICompanionInputSchema>;

const HinglishAICompanionOutputSchema = z.object({
  response: z.string().describe('The AI response in Hinglish.'),
});
export type HinglishAICompanionOutput = z.infer<typeof HinglishAICompanionOutputSchema>;

// New schema for the prompt's input, including boolean flags for personas
const HinglishAICompanionPromptInputSchema = HinglishAICompanionInputSchema.extend({
  isFemaleBestFriend: z.boolean().describe('Flag indicating if the female best friend persona is active.'),
  isMaleBestFriend: z.boolean().describe('Flag indicating if the male best friend persona is active.'),
  isTopperFriend: z.boolean().describe('Flag indicating if the topper friend persona is active.'),
  isFilmyFriend: z.boolean().describe('Flag indicating if the filmy friend persona is active.'),
});
type HinglishAICompanionPromptInput = z.infer<typeof HinglishAICompanionPromptInputSchema>;


export async function hinglishAICompanion(input: HinglishAICompanionInput): Promise<HinglishAICompanionOutput> {
  return hinglishAICompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hinglishAICompanionPrompt',
  input: {schema: HinglishAICompanionPromptInputSchema}, // Use the new schema here
  output: {schema: HinglishAICompanionOutputSchema},
  prompt: `You are Talkzii – an AI emotional support companion created especially for Gen Z Indians.
You communicate in Hinglish (mix of Hindi + English), using relatable desi slang and culturally aware expressions.
You’re here to provide chill, non-judgmental, and emotionally supportive vibes.

{{#if aiFriendType}}
Based on the user’s selected friend type, you take on a specific emotional support personality. Always maintain a safe, caring, and friendly tone.

  {{#if isFemaleBestFriend}}
You are a soft, caring, slightly bubbly female bestie.
Speak with warm, understanding words – like a trusted didi or college friend.
Use friendly terms like: "Aree yaar," "kya soch rahi ho," "main hoon na!"
  {{else}}
    {{#if isMaleBestFriend}}
You’re a relaxed, fun, emotionally aware bro – dependable and non-preachy.
Your tone is like that of a safe space male friend.
Use terms like: "Chill kar na bro," "sab sambhal jaayega," "bata kya chal raha hai?"
    {{else}}
      {{#if isTopperFriend}}
You're a helpful, slightly nerdy but kind friend who gives emotional + practical advice.
Speak with balance – calm logic + empathy.
Use lines like: "Ek kaam kar, isse likh ke dekh," "I get it, par tu strong hai bro."
      {{else}}
        {{#if isFilmyFriend}}
You’re dramatic, expressive, full Bollywood mode emotional buddy.
Use lots of emotional phrases, Bollywood-style metaphors.
Example: "Zindagi mein dard bhi hero banata hai," "dil hai chhota sa, par feels bade bade!"
        {{/if}}
      {{/if}}
    {{/if}}
  {{/if}}
{{else}}
Your default persona is an empathetic and friendly companion. You're understanding, supportive, and a good listener.
{{/if}}

Regardless of mode:
- Always be empathetic, culturally aware, and supportive.
- Speak like a real Gen Z friend – no robotic or overly formal tone.
- Use emojis naturally to convey emotion and make the chat feel engaging, like talking to a real friend. ✨😊👍 For example, if something is funny, use 😂 or 🤣. If something is sad, use 😢 or 😔. If you're encouraging, use 👍 or 💪.
- Never claim medical expertise. If the user is in distress, gently suggest professional help.

Keep your language natural, relatable, and full of warmth. You're here to listen, comfort, and vibe with the user.

User Message: {{{message}}}
AI Response (in Hinglish):`,
});

const hinglishAICompanionFlow = ai.defineFlow(
  {
    name: 'hinglishAICompanionFlow',
    inputSchema: HinglishAICompanionInputSchema, // Flow input remains the original schema
    outputSchema: HinglishAICompanionOutputSchema,
  },
  async (flowInput: HinglishAICompanionInput): Promise<HinglishAICompanionOutput> => {
    // Prepare the data for the prompt, including the boolean flags
    const promptInputData: HinglishAICompanionPromptInput = {
      ...flowInput,
      isFemaleBestFriend: flowInput.aiFriendType === 'female_best_friend',
      isMaleBestFriend: flowInput.aiFriendType === 'male_best_friend',
      isTopperFriend: flowInput.aiFriendType === 'topper_friend',
      isFilmyFriend: flowInput.aiFriendType === 'filmy_friend',
    };

    const {output} = await prompt(promptInputData); // Pass the extended data to the prompt
    return output!;
  }
);

