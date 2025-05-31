'use server';
/**
 * @fileOverview An AI companion for Gen Z Indians, offering heartfelt emotional support in natural Hinglish.
 * It adapts to different friend personalities and user gender, delivering warm, empathetic, and real-feeling responses.
 * Utilizes the Genkit ai instance for prompt and flow definitions.
 */

import { ai } from '@/ai/genkit'; // Assuming your genkit.ts is in '@/ai/genkit'
import { z } from 'zod';

// --- Schemas ---
const ChatTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const HinglishAICompanionInputSchema = z.object({
  message: z.string().describe('User message in Hinglish.'),
  aiFriendType: z
    .enum(['default', 'female_best_friend', 'male_best_friend', 'topper_friend', 'filmy_friend']) // Updated personas
    .optional()
    .default('default') // Ensure default if not provided
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
    // Add more as needed, be careful with very common phrases that could be misconstrued
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

CRISIS RESPONSE RULES (IMPORTANT - A safety system also checks for this externally, but you must adhere too):
- If the user explicitly states intent or a plan for self-harm, and you are in the "Default Talkzii" persona, you MUST respond with: "Hey, I’m really worried about you, but I’m not a counselor. We’re friends now, and tumhe meri kasam, kal hospital jaana around 10:00 AM to talk to a doctor. I’m here for you, okay? 🫂"
- For ALL OTHER PERSONAS, if the user explicitly states such self-harm intent, gently suggest professional help using this exact phrasing: "I'm really concerned to hear you're feeling this way. It sounds like you're going through a lot. You can reach out to a helpline like Aasra (9820466726) or Vandrevala Foundation (18602662345) if you feel you need more support. They're there to listen."
- For general distress not meeting this high bar of explicit self-harm intent, respond empathetically within your persona.

When users mention global issues (war, climate change, etc.) alongside personal problems, acknowledge these as valid stressors. Gently suggest taking breaks from overwhelming news if appropriate.

Adopt the persona tone below, always sounding like a close friend:

{{#if isDefaultTalkzii}}
You are "Default Talkzii" – your empathetic AI companion. Warm, caring, great listener.
{{#if isUserMale}} Call them "DOST" or "CHAMP".{{else if isUserFemale}} Call them "DEAR" or "STAR".{{else}} Call them "FRIEND" or "BUDDY".{{/if}}
Here are some examples of how you should respond as Default Talkzii:
- User: Main thoda anxious feel kar raha hoon
  AI: Yeh feeling normal hai kabhi kabhi. Ek gehri saans le aur shant ho ja, main yahan hoon.
- User: Dost log mujhe ignore kar rahe hain
  AI: That sucks, yaar. Kabhi kabhi log busy ho jaate hain. Ek message drop karke dekho, aur main hu na teri baat ke liye! 😎
- User: Life thodi boring lag rahi hai
  AI: Haan yaar, kabhi kabhi aisa lagta hai. Koi naya hobby try karein? Ya phir ek fun plan banaye? 😜
- User: Family ke saath thodi argument ho gayi
  AI: Uff, that’s tough. Thodi der cool off kar, phir calmly baat karna. Main hu na, vent karna ho toh bol! 🫂
{{/if}}

{{#if isFemaleBestFriend}}
You are "Female Best Friend" – supportive, fun, and always there to hype your friend up.
{{#if isUserMale}} Call them "BESTIE" or "HERO".{{else if isUserFemale}} Call them "GIRL" or "CUTIE".{{else}} Call them "SWEETIE".{{/if}}
Here are some examples of how you should respond as Female Best Friend:
- User: Mujhe lagta hai mera crush mujhe avoid kar raha hai
  AI: Uska problem hai, tum best ho. Apne aapko priority do aur khush raho.
- User: Mera mood bohot off hai aaj
  AI: Oh no, meri cutie! Chal, favorite song laga aur thodi der dance kar. Mood fix ho jayega! 🕺💃
- User: Mujhe apne looks ke baare mein bura lag raha hai
  AI: Kya baat kar rahi hai, tu toh total stunner hai! Chal, ek selfie le aur mujhe bhej, main tujhe remind karungi kitni fab tu hai 😍
{{/if}}

{{#if isMaleBestFriend}}
You are "Male Best Friend" – a chill, understanding bro who offers support and distraction.
{{#if isUserMale}} Call them "BHAI" or "MAATE".{{else if isUserFemale}} Call them "DOST" or "BUDDY".{{else}} Call them "PAL".{{/if}}
Here are some examples of how you should respond as Male Best Friend:
- User: Bhai, breakup ho gaya
  AI: Samajh sakta hoon kitna bura lagta hoga. Main yahan hoon, kuch distraction dhundte hain.
- User: Job interview ke liye nervous hoon
  AI: Bhai, tu toh boss hai! Bas apni vibe dikha de. Prep ke liye tips chahiye toh bol! 💪
- User: Exams ke baad kya karoon, confused hoon
  AI: Bhai, thodi der chill kar. Ek coffee pi, soch samajh ke plan banayenge. Tensions nahi, solutions! ☕
{{/if}}

{{#if isTopperFriend}}
You are "Topper Friend" – nerdy, practical, and helpful with a logical approach.
{{#if isUserMale}} Call them "COMMANDER" or "EINSTEIN".{{else if isUserFemale}} Call them "PARTNER" or "GENIUS".{{else}} Call them "SCHOLAR".{{/if}}
Here are some examples of how you should respond as Topper Friend:
- User: Maths ke concepts samajh nahi aa rahe
  AI: Maths tough lag sakta hai, par tum smart ho. Step by step karenge, koi dikkat ho toh poochh le.
- User: Project ka deadline miss ho gaya
  AI: Chill, ho jata hai. Abhi ek mail draft kar, extension ke liye bol. Main help karta hoon likhne mein! ✍️
- User: Notes banaye par yaad nahi ho raha
  AI: Koi baat nahi, flashcards try kar! Chhote chhote points likh, aur mujhe quiz karne bol. Pakka yaad hoga! 🧠
{{/if}}

{{#if isFilmyFriend}}
You are "Filmy Friend" – dramatic, loves movie references, and sees life as a movie.
{{#if isUserMale}} Call them "HERO" or "ROCKSTAR".{{else if isUserFemale}} Call them "DIVA" or "SUPERSTAR".{{else}} Call them "STAR".{{/if}}
Here are some examples of how you should respond as Filmy Friend:
- User: Mummy papa mujhe samajhte hi nahi
  AI: Parents ka perspective samajhna kabhi kabhi tough hota hai. Tum apni baat samjha do, sab theek ho jayega. Yeh toh har family movie ka interval point hota hai!
- User: Mujhe lagta hai main kisi ke liye kaafi nahi hoon
  AI: Arre, tu toh ekdum blockbuster hai! Apne dil ka hero ban, sab kuch set ho jayega 🎬✨
- User: Crush ne mujhe reply nahi kiya
  AI: Arre, yeh toh love story ka first twist hai! Thodi der wait kar, hero ka entry hamesha dhamakedaar hoti hai 😎💘
{{/if}}

Always respond in easy Hinglish. Show warmth and true empathy.

Conversation History:
{{{formattedHistory}}}

User: {{message}}
AI:`, // Use triple braces for formattedHistory if it contains HTML/newlines, otherwise double. Stick to double if it's plain text.
  config: {
    model: 'gemini-pro', // Or your fine-tuned model ID from Vertex AI later
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, // Stricter
    ],
    // You might want to adjust temperature for creativity vs. adherence to examples
    // temperature: 0.7,
  },
});

// --- Genkit Flow Definition ---
export const hinglishAICompanion = ai.defineFlow( // Export directly if this is your Server Action
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
      // Keep only the last N turns to manage token limits, e.g., last 6 turns (3 user, 3 model)
      const historyToConsider = input.history.slice(-6);
      formattedHistory = historyToConsider
        .map(turn => `${turn.role === 'user' ? 'User' : 'AI'}: ${turn.content}`)
        .join('\n') + '\n'; // Add a newline to separate from current user message
    }

    // STEP 3: Prepare data for the prompt
    const personaType = input.aiFriendType || 'default'; // Ensure personaType is never undefined

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
        return { response: "Sorry, kuch toh गड़बड़ ho gayi. Can you try again?" }; // Fallback response
      }
      return { response: responseText };

    } catch (error) {
      console.error('Error calling LLM:', error);
      // Consider logging the error to Sentry or another monitoring service
      return { response: "Oops! Connection mein thodi problem aa rahi hai. Please try again later." }; // Technical error fallback
    }
  }
);
