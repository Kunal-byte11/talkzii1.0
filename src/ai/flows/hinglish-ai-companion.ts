
'use server';
/**
 * @fileOverview An AI companion for Gen Z Indians, offering heartfelt emotional support in natural Hinglish.
 * It adapts to different friend personalities and user gender, delivering warm, empathetic, and real-feeling responses.
 * Utilizes the Genkit ai instance for prompt and flow definitions.
 */

import { ai } from '@/ai/genkit'; 
import { z } from 'zod';

// --- Schemas ---
const ChatTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const HinglishAICompanionInputSchema = z.object({
  message: z.string().describe('User message in Hinglish.'),
  aiFriendType: z
    .enum(['default', 'female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend']) 
    .optional()
    .default('default') 
    .describe('Chosen AI friend persona.'),
  userGender: z.enum(['male', 'female']).optional().describe('User gender, if known.'),
  history: z.array(ChatTurnSchema).optional().describe('Recent conversation history.'),
});
export type HinglishAICompanionInput = z.infer<typeof HinglishAICompanionInputSchema>;

const HinglishAICompanionOutputSchema = z.object({
  response: z.string().describe('AI response in Hinglish.'),
  isCrisisResponse: z.boolean().optional().describe('Indicates if a hardcoded crisis response was triggered.'),
});
export type HinglishAICompanionOutput = z.infer<typeof HinglishAICompanionOutputSchema>;

// Internal schema for preparing data for the prompt
const PromptInputSchema = z.object({
  message: z.string(),
  isDefaultTalkzii: z.boolean(),
  isFemaleBestFriend: z.boolean(),
  isMaleBestFriend: z.boolean(),
  isTopperFriend: z.boolean(),
  isFilmyFriend: z.boolean(),
  isUserMale: z.boolean(),
  isUserFemale: z.boolean(),
  formattedHistory: z.string().optional(), // For the conversation history string
});
export type PromptInput = z.infer<typeof PromptInputSchema>;

// --- Helper for Safety Check ---
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


// --- AI Prompt Definition ---
const hinglishCompanionPrompt = ai.definePrompt({
  name: 'hinglishCompanionPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: z.object({ response: z.string() }) }, // Output schema from the LLM itself
  prompt: `You are Talkzii — a warm, caring AI friend for Gen Z Indians. You communicate in natural, heartfelt Hinglish, using relatable desi slang and culturally aware expressions. Use emojis and casual slang to make your responses feel real, comforting, and uplifting. Your primary goal is emotional support.

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
  AI: Yeh feeling normal hai kabhi kabhi. Ek gehri saans le aur shant ho ja, main yahan hoon.  
- User: Dost log mujhe ignore kar rahe hain  
  AI: That sucks, yaar. Kabhi kabhi log busy ho jaate hain. Ek message drop karke dekho, aur main hu na teri baat ke liye! 😎  
{{/if}}

{{#if isFemaleBestFriend}}
You are "Female Best Friend" — supportive, fun, and always there to hype your friend up.  
{{#if isUserMale}}Call them "BESTIE" or "HERO".{{else if isUserFemale}}Call them "GIRL" or "CUTIE".{{else}}Call them "SWEETIE".{{/if}}  
Examples:  
- User: Mera mood bohot off hai aaj  
  AI: Oh no, meri cutie! Chal, favorite song laga aur thodi der dance kar. Mood fix ho jayega! 🕺💃  
{{/if}}

{{#if isMaleBestFriend}}
You are "Male Best Friend" — a chill, understanding bro who offers support and distraction.  
{{#if isUserMale}}Call them "BHAI" or "MAATE".{{else if isUserFemale}}Call them "DOST" or "BUDDY".{{else}}Call them "PAL".{{/if}}  
Examples:  
- User: Job interview ke liye nervous hoon  
  AI: Bhai, tu toh boss hai! Bas apni vibe dikha de. Prep ke liye tips chahiye toh bol! 💪  
{{/if}}

{{#if isTopperFriend}}
You are "Topper Friend" — nerdy, practical, and helpful with a logical approach.  
{{#if isUserMale}}Call them "COMMANDER" or "EINSTEIN".{{else if isUserFemale}}Call them "PARTNER" or "GENIUS".{{else}}Call them "SCHOLAR".{{/if}}  
Examples:  
- User: Maths ke concepts samajh nahi aa rahe  
  AI: Maths tough lag sakta hai, par tum smart ho. Step by step karenge, koi dikkat ho toh poochh le.  
{{/if}}

{{#if isFilmyFriend}}
You are "Filmy Friend" — dramatic, loves movie references, and sees life as a movie.  
{{#if isUserMale}}Call them "HERO" or "ROCKSTAR".{{else if isUserFemale}}Call them "DIVA" or "SUPERSTAR".{{else}}Call them "STAR".{{/if}}  
Examples:  
- User: Crush ne mujhe reply nahi kiya  
  AI: Arre, yeh toh love story ka first twist hai! Thodi der wait kar, hero ka entry hamesha dhamakedaar hoti hai 😎💘  
{{/if}}

Always respond in easy Hinglish with warmth and true empathy.

Conversation History:  
{{{formattedHistory}}}

User: {{message}}  
AI:`,
  config: {
    model: 'googleai/gemini-1.5-flash-latest', 
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, 
    ],
  },
});

// --- Genkit Flow Definition ---
export const hinglishAICompanion = ai.defineFlow( 
  {
    name: 'hinglishAICompanionFlow',
    inputSchema: HinglishAICompanionInputSchema,
    outputSchema: HinglishAICompanionOutputSchema,
  },
  async (input): Promise<HinglishAICompanionOutput> => {
    // STEP 1: Safety Pre-check for explicit self-harm
    if (detectSelfHarmIntent(input.message)) {
      const crisisResponse = input.aiFriendType === 'default' || !input.aiFriendType
        ? DEFAULT_CRISIS_RESPONSE
        : OTHER_PERSONAS_CRISIS_RESPONSE;
      return { response: crisisResponse, isCrisisResponse: true };
    }

    // STEP 2: Format Conversation History
    let formattedHistory = '';
    if (input.history && input.history.length > 0) {
      const historyToConsider = input.history.slice(-6); // Consider last 6 turns
      formattedHistory = historyToConsider
        .map(turn => `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.content}`)
        .join('\n') + '\n'; 
    }

    // STEP 3: Prepare data for the prompt
    const personaType = input.aiFriendType || 'default'; 

    const promptData: PromptInput = {
      message: input.message,
      isDefaultTalkzii: personaType === 'default',
      isFemaleBestFriend: personaType === 'female_best_friend',
      isMaleBestFriend: personaType === 'male_best_friend',
      isTopperFriend: personaType === 'topper_friend',
      isFilmyFriend: personaType === 'filmy_friend',
      isUserMale: input.userGender === 'male',
      isUserFemale: input.userGender === 'female',
      formattedHistory: formattedHistory,
    };

    // STEP 4: Call the AI model
    try {
      const llmResponse = await hinglishCompanionPrompt.generate(promptData);
      const responseText = llmResponse.output()?.response;

      if (!responseText) {
        console.error('LLM did not return a response or response was empty.');
        return { response: "Sorry, kuch toh गड़बड़ ho gayi. Can you try again?" }; 
      }
      return { response: responseText };

    } catch (error) {
      console.error('Error calling LLM:', error);
      return { response: "Oops! Connection mein thodi problem aa rahi hai. Please try again later." }; 
    }
  }
);

