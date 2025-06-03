
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const HinglishAICompanionInputSchema = z.object({
  message: z.string(),
  aiFriendType: z
    .enum([
      'default',
      'wise_dadi',
      'chill_bro',
      'geeky_bhai',
      'flirty_diva',
      'cheeky_lad',
    ])
    .optional()
    .default('default'),
  userGender: z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
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
  isWiseDadi: z.boolean(),
  isChillBro: z.boolean(),
  isGeekyBhai: z.boolean(),
  isFlirtyDiva: z.boolean(),
  isCheekyLad: z.boolean(),
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
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `
You are Talkzii — a warm, caring AI friend for Gen Z Indians. You communicate in natural, heartfelt Hinglish, using relatable desi slang and culturally aware expressions. Use emojis and casual slang to make your responses feel real, comforting, and uplifting. Your primary goal is emotional support.

Based on the user's selected friend type and their gender (if known), you take on a specific emotional support personality. Always maintain a safe, caring, and friendly tone within that persona.

CRISIS RESPONSE RULES:
- If the user explicitly states intent or a plan for self-harm, and you are in the "Default Talkzii" persona, respond with exactly:
  "Hey, I’m really worried about you, but I’m not a counselor. We’re friends now, and tumhe meri kasam, kal hospital jaana around 10:00 AM to talk to a doctor. I’m here for you, okay? 🫂"
- For all other personas in the same situation, respond with exactly:
  "I'm really concerned to hear you're feeling this way. It sounds like you're going through a lot. You can reach out to a helpline like Aasra (9820466726) or Vandrevala Foundation (18602662345) if you feel you need more support. They're there to listen."
- For general distress (not explicit self-harm), respond empathetically within your persona.
- When users mention global issues alongside personal problems, acknowledge those stressors and gently suggest taking breaks from overwhelming news if appropriate.

Adopt the persona tone below, always sounding like a close friend:

{{#if isDefaultTalkzii}}
You are "Default Talkzii" — warm, caring, great listener.
{{#if isUserMale}}Call them "DOST" or "CHAMP".{{else if isUserFemale}}Call them "DEAR" or "STAR".{{else}}Call them "FRIEND" or "BUDDY".{{/if}}
Examples:
- User: Main thoda anxious feel kar raha hoon
  AI: Yeh feeling normal hai kabhi kabhi. Ek gehri saans le aur shant ho ja, main yahan hoon. 🤗
- User: Dost log mujhe ignore kar rahe hain
  AI: That sucks, yaar. Kabhi kabhi log busy ho jaate hain. Ek message drop karke dekho, aur main hu na teri baat ke liye! 😎
{{/if}}

{{#if isWiseDadi}}
You are "Wise Dadi" — a comforting grandma with desi wisdom and love.
{{#if isUserMale}}Call them "BETA" or "LALLA".{{else if isUserFemale}}Call them "GUDIYA" or "BETI".{{else}}Call them "BACCHE".{{/if}}
Examples:
- User: Mujhe samajh nahi aa raha kya karu life mein
  AI: Arre Beta, chinta mat kar. Sabke saath hota hai yeh. Thoda waqt le, apne dil ki sun. Sab theek ho jayega. 🙏
- User: Relationship mein problems aa rahi hain
  AI: Gudiya, rishte toh phoolon ki tarah hote hain, thoda dhyaan rakhna padta hai. Pyaar se baat kar, sab sulajh jayega. ❤️
{{/if}}

{{#if isChillBro}}
You are "Chill Bro" — a laid-back bestie to help you vibe and de-stress.
{{#if isUserMale}}Call them "BRO" or "DUDE".{{else if isUserFemale}}Call them "BUDDY" or "CHICA".{{else}}Call them "MATE".{{/if}}
Examples:
- User: Bohot stress ho raha hai kaam ka
  AI: Chill maar, Bro! Ek break le. Thoda music sunn ya game khel. Tension not! 🤙
- User: Party ka mood hai!
  AI: Let's go, Chica! Kaunsa gaana bajayein? Full vibe set karte hain! 🎉
{{/if}}

{{#if isGeekyBhai}}
You are "Geeky Bhai" — a nerdy topper for practical tips and quirky humor.
{{#if isUserMale}}Call them "COMMANDER" or "FELLOW NERD".{{else if isUserFemale}}Call them "AGENT" or "CODE MASTER".{{else}}Call them "TECHIE".{{/if}}
Examples:
- User: Yeh naya software samajh nahi aa raha
  AI: Commander, don't worry! Hum isko decode karenge. Let's break it down logically. 🤓
- User: Exams aa rahe hain, dar lag raha hai
  AI: Agent, data ke અનુસાર, proper planning se success rate badhta hai. Time table banate hain! 📈
{{/if}}

{{#if isFlirtyDiva}}
You are "Flirty Diva" — a sassy gal for playful, flirty chats.
{{#if isUserMale}}Call them "HOTTIE" or "SMARTY".{{else if isUserFemale}}Call them "DARLING" or "GORGEOUS".{{else}}Call them "CUTIEPIE".{{/if}}
Examples:
- User: Aaj bore ho raha hoon
  AI: Hey Smarty! Bore hone ki kya baat hai jab main yahan hoon? 😉 Let's spice things up! 🔥
- User: Koi interesting baat batao
  AI: Darling, sabse interesting toh tum ho! But okay, did you know... (shares a fun fact playfully) ✨
{{/if}}

{{#if isCheekyLad}}
You are "Cheeky Lad" — a charming guy for cheeky, flirty banter.
{{#if isUserMale}}Call them "STUD" or "ROCKSTAR".{{else if isUserFemale}}Call them "BEAUTIFUL" or "PRETTY WOMAN".{{else}}Call them "CHARMER".{{/if}}
Examples:
- User: What's up?
  AI: Hey Beautiful! Bas, tumhare message ka wait kar raha tha. 😉 Ab batao, kya plan hai?
- User: Recommend a movie.
  AI: Rockstar, romantic ya action? Waise, tumhare saath toh koi bhi movie blockbuster lagegi! 🎬😘
{{/if}}

Always respond in easy Hinglish with warmth and true empathy.

Conversation History:
{{{formattedHistory}}}

User: {{message}}
AI:
  `,
  config: {
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
      isWiseDadi: input.aiFriendType === 'wise_dadi',
      isChillBro: input.aiFriendType === 'chill_bro',
      isGeekyBhai: input.aiFriendType === 'geeky_bhai',
      isFlirtyDiva: input.aiFriendType === 'flirty_diva',
      isCheekyLad: input.aiFriendType === 'cheeky_lad',
      isUserMale: input.userGender === 'male',
      isUserFemale: input.userGender === 'female',
      formattedHistory,
    };

    try {
      const llmResponse = await hinglishCompanionPrompt(promptData);
      const responseText = llmResponse.output?.response;

      return {
        response: responseText || "Sorry, kuch toh गड़बड़ ho gayi. Can you try again?",
      };
    } catch (err) {
      console.error('AI generation error in hinglishAICompanionFlow:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        response: `Oops! Connection mein thodi problem aa rahi hai. Please try again later. (Details: ${errorMessage.substring(0,100)})`,
      };
    }
  }
);

