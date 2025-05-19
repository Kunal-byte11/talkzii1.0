
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  isLoading?: boolean;
  isCrisis?: boolean;
}

export interface UserProfile {
  id: string; // Should match Supabase auth user ID (UUID)
  username: string; // Make username non-optional as it's collected at signup
  email?: string;
  gender: 'male' | 'female'; // Make gender non-optional
  date_of_birth: string; // Store as 'YYYY-MM-DD' string, make non-optional
  // Add other profile fields as needed
  created_at?: string;
  updated_at?: string;
}
