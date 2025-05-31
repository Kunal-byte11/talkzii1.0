
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  isLoading?: boolean;
  isCrisis?: boolean;
  feedback?: 'liked' | 'disliked' | null; 
  userPromptText?: string; 
  personaImage?: string; // Added for AI persona image
}

export interface UserProfile {
  id: string; 
  username: string;
  email: string; 
  gender: 'male' | 'female' | 'prefer_not_to_say';
  created_at?: string;
  updated_at?: string;
}
