
// FeedbackType is no longer needed as feedback feature is removed
// export type FeedbackType = 'liked' | 'disliked' | null;

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // 'system' for crisis or info messages
  timestamp: number; // Use number (Date.now()) for easier serialization
  isLoading?: boolean; // Optional flag for AI messages being generated
  isCrisis?: boolean; // Optional flag for crisis messages
  // feedback?: FeedbackType; // Removed as feedback mechanism is removed
  // originalUserPromptForAiResponse?: string; // Removed as feedback mechanism is removed
}
