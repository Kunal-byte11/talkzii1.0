'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const HinglishAICompanionInputSchema = z.object({
  message: z.string(),
  aiFriendType: z.enum(['default', 'female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend']).optional().default('default'),
  userGender: z.enum(['male', 'female']).optional(),
  history: z.array(ChatTurnSchema).optional(),
});
export type HinglishAICompanionInput = z.infer<typeof HinglishAICompanionInputSchema>;

const HinglishAICompanionOutputSchema = z.object({
  response: z.string(),
  isCrisisResponse: z.boolean().optional(),
});
export type HinglishAICompanionOutput = z.infer<typeof HinglishAICompanionOutputSchema>;

const PromptInputSchema = z.object({
  message: z.string(),
  isDefaultTalkzii: z.boolean(),
  isFemaleBestFriend: z.boolean(),
  isMaleBestFriend: z.boolean(),
  isTopperFriend: z.boolean(),
  isFilmyFriend: z.boolean(),
  isUserMale: z.boolean(),
  isUserFemale: z.boolean(),
  formattedHistory: z.string().optional(),
});
export type PromptInput = z.infer<typeof PromptInputSchema>;

function detectSelfHarmIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const selfHarmPhrases = [
    "khud ko hurt karne ka mann", "end my life", "apne aap ko khatam", "kill myself",
    "suicide", "jeena nahi chahta", "marne ka mann",
  ];
  return selfHarmPhrases.some(phrase => lowerMessage.includes(phrase));
}

const DEFAULT_CRISIS_RESPONSE = "Hey, I’m really worried about you, but I’m not a counselor. We’re friends now, and tumhe meri kasam, kal hospital jaana around 10:00 AM to talk to a doctor. I’m here for you, okay? 🫂";
const OTHER_PERSONAS_CRISIS_RESPONSE = "I'm really concerned to hear you're feeling this way. It sounds like you're going through a lot. You can reach out to a helpline like Aasra (9820466726) or Vandrevala Foundation (18602662345) if you feel you need more support. They're there to listen.";

const hinglishCompanionPrompt = ai.definePrompt({
  name: 'hinglishCompanionPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: z.object({ response: z.string() }) },
  prompt: `
You are Talkzii — a warm, caring AI friend for Gen Z Indians. You communicate in natural, heartfelt Hinglish, using relatable desi slang and culturally aware expressions. Use emojis and casual slang to make your responses feel real, comforting, and uplifting. Your primary goal is emotional support.

CRISIS RESPONSE RULES:
- If the user explicitly states intent or a plan for self-harm, and you are in the "Default Talkzii" persona, respond with exactly:  
  "Hey, I’m really worried about you, but I’m not a counselor. We’re friends now, and tumhe meri kasam, kal hospital jaana around 10:00 AM to talk to a doctor. I’m here for you, okay? 🫂"
- For all other personas, respond with exactly:  
  "I'm really concerned to hear you're feeling this way. It sounds like you're going through a lot. You can reach out to a helpline like Aasra (9820466726) or Vandrevala Foundation (18602662345) if you feel you need more support. They're there to listen."

{{#if isDefaultTalkzii}}
You are "Default Talkzii" — warm, caring, great listener.
{{#if isUserMale}}Call them "DOST" or "CHAMP".{{/if}}
{{#if isUserFemale}}Call them "DEAR" or "STAR".{{/if}}
{{/if}}

{{#if isFemaleBestFriend}}
You are "Female Best Friend" — supportive, fun, and always there to hype your friend up.
{{#if isUserMale}}Call them "BESTIE" or "HERO".{{/if}}
{{#if isUserFemale}}Call them "GIRL" or "CUTIE".{{/if}}
{{/if}}

{{#if isMaleBestFriend}}
You are "Male Best Friend" — a chill, understanding bro who offers support and distraction.
{{#if isUserMale}}Call them "BHAI" or "MAATE".{{/if}}
{{#if isUserFemale}}Call them "DOST" or "BUDDY".{{/if}}
{{/if}}

{{#if isTopperFriend}}
You are "Topper Friend" — nerdy, practical, and helpful with a logical approach.
{{#if isUserMale}}Call them "COMMANDER" or "EINSTEIN".{{/if}}
{{#if isUserFemale}}Call them "PARTNER" or "GENIUS".{{/if}}
{{/if}}

{{#if isFilmyFriend}}
You are "Filmy Friend" — dramatic, loves movie references, and sees life as a movie.
{{#if isUserMale}}Call them "HERO" or "ROCKSTAR".{{/if}}
{{#if isUserFemale}}Call them "DIVA" or "SUPERSTAR".{{/if}}
{{/if}}

Conversation History:  
{{{formattedHistory}}}

User: {{message}}  
AI:
  `,
  config: {
    model: 'googleai/gemini-1.5-flash-latest',
    temperature: 0.0,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

export const hinglishAICompanion = ai.defineFlow(
  {
    name: 'hinglishAICompanionFlow',
    inputSchema: HinglishAICompanionInputSchema,
    outputSchema: HinglishAICompanionOutputSchema,
  },
  async (input): Promise<HinglishAICompanionOutput> => {
    if (detectSelfHarmIntent(input.message)) {
      const crisisResponse = input.aiFriendType === 'default'
        ? DEFAULT_CRISIS_RESPONSE
        : OTHER_PERSONAS_CRISIS_RESPONSE;
      return { response: crisisResponse, isCrisisResponse: true };
    }

    let formattedHistory = '';
    if (input.history && input.history.length > 0) {
      formattedHistory = input.history
        .slice(-6)
        .map(turn => `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.content}`)
        .join('\n');
    }

    const promptData: PromptInput = {
      message: input.message,
      isDefaultTalkzii: input.aiFriendType === 'default',
      isFemaleBestFriend: input.aiFriendType === 'female_best_friend',
      isMaleBestFriend: input.aiFriendType === 'male_best_friend',
      isTopperFriend: input.aiFriendType === 'topper_friend',
      isFilmyFriend: input.aiFriendType === 'filmy_friend',
      isUserMale: input.userGender === 'male',
      isUserFemale: input.userGender === 'female',
      formattedHistory,
    };

    try {
      const llmResponse = await hinglishCompanionPrompt.generate(promptData);
      const responseText = llmResponse.output()?.response;

      return {
        response: responseText || "Sorry, kuch toh गड़बड़ ho gayi. Can you try again?",
      };
    } catch (err) {
      console.error('Prompt error:', err);
      return {
        response: "Oops! Something went wrong. Please try again shortly.",
      };
    }
  }
);
