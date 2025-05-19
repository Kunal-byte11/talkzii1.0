
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system'; // 'system' for crisis or info messages
  timestamp: number; // Use number (Date.now()) for easier serialization
  isLoading?: boolean; // Optional flag for AI messages being generated
  isCrisis?: boolean; // Optional flag for crisis messages
}

// UserProfile type is no longer needed as auth features are removed.
// If you decide to add user-specific features without full auth later,
// you might re-introduce a simplified profile/preferences type.
