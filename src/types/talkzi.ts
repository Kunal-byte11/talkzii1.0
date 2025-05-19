
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
  username?: string; // Added username
  email?: string;
  gender?: 'male' | 'female' | 'prefer_not_to_say'; // Allow prefer_not_to_say
  date_of_birth?: string; // Store as 'YYYY-MM-DD' string
  avatar_url?: string | null;
  // Add other profile fields as needed
  created_at?: string;
  updated_at?: string;
}
